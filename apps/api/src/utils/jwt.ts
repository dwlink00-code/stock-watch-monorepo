import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
