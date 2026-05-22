import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { env } from "../config/env.js";

export function hasFirebaseConfig() {
  return Boolean(
    env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY,
  );
}

function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPriceAlertNotification(input: {
  tokens: string[];
  symbol: string;
  targetPrice: number;
  currentPrice: number;
}) {
  const app = getFirebaseApp();

  if (!app || input.tokens.length === 0) {
    return {
      sentCount: 0,
      skipped: true,
    };
  }

  const response = await getMessaging(app).sendEachForMulticast({
    tokens: input.tokens,
    notification: {
      title: `${input.symbol} crossed your alert`,
      body: `${input.symbol} is now $${input.currentPrice.toFixed(2)} and moved above your alert price of $${input.targetPrice.toFixed(2)}.`,
    },
    data: {
      symbol: input.symbol,
      targetPrice: input.targetPrice.toString(),
      currentPrice: input.currentPrice.toString(),
      type: "price-alert",
    },
  });

  return {
    sentCount: response.successCount,
    skipped: false,
  };
}
