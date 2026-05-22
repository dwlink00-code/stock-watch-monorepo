import { AlertStatus } from "@prisma/client";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { sendPriceAlertNotification } from "../lib/firebase.js";
import { getQuote } from "./finnhub.js";

export async function evaluateActiveAlerts() {
  const activeAlerts = await prisma.alert.findMany({
    where: {
      status: AlertStatus.ACTIVE,
    },
    include: {
      user: {
        include: {
          deviceTokens: true,
        },
      },
    },
  });

  if (activeAlerts.length === 0) {
    return {
      evaluatedCount: 0,
      triggeredCount: 0,
    };
  }

  const quoteCache = new Map<string, Awaited<ReturnType<typeof getQuote>>>();
  let triggeredCount = 0;

  for (const alert of activeAlerts) {
    let quote = quoteCache.get(alert.symbol);

    if (!quote) {
      quote = await getQuote(alert.symbol);
      quoteCache.set(alert.symbol, quote);
    }

    if (quote.currentPrice < alert.targetPrice) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: {
          currentPrice: quote.currentPrice,
        },
      });
      continue;
    }

    const tokens = alert.user.deviceTokens.map((device) => device.token);

    const notificationResult = await sendPriceAlertNotification({
      tokens,
      symbol: alert.symbol,
      targetPrice: alert.targetPrice,
      currentPrice: quote.currentPrice,
    });

    if (notificationResult.skipped) {
      console.warn("[alerts] notification skipped", {
        alertId: alert.id,
        symbol: alert.symbol,
        reason:
          tokens.length === 0 ? "no_device_tokens" : "firebase_not_configured",
      });
    } else if (notificationResult.sentCount === 0) {
      console.warn("[alerts] notification send failed for all tokens", {
        alertId: alert.id,
        symbol: alert.symbol,
        failureCount: notificationResult.failureCount ?? 0,
      });
    } else {
      console.log("[alerts] notification sent", {
        alertId: alert.id,
        symbol: alert.symbol,
        sentCount: notificationResult.sentCount,
      });
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        currentPrice: quote.currentPrice,
        status: AlertStatus.TRIGGERED,
        triggeredAt: new Date(),
        notificationSentAt:
          notificationResult.sentCount > 0 ? new Date() : null,
      },
    });

    triggeredCount += 1;
  }

  return {
    evaluatedCount: activeAlerts.length,
    triggeredCount,
  };
}

export function startAlertWorker() {
  const intervalId = setInterval(() => {
    evaluateActiveAlerts().catch((error) => {
      console.error("Alert worker failed", error);
    });
  }, env.ALERT_POLL_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
  };
}
