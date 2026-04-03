import jwt from "jsonwebtoken";
import crypto, { randomUUID } from "crypto";
import ApiError from "./apiError.js";

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? "7d";
const ISSUER = process.env.JWT_ISSUER ?? "app";
const AUDIENCE = process.env.JWT_AUDIENCE ?? "app-users";

export const validateJwtSecrets = () => {
  const missing = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    throw ApiError.internal(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw ApiError.internal("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be distinct.");
  }
};

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: String(user._id),
      jti: randomUUID(),
    },
    ACCESS_SECRET(),
    {
      expiresIn: ACCESS_EXPIRY,
      algorithm: "HS256",
      issuer: ISSUER,
      audience: AUDIENCE,
    }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET(), { issuer: ISSUER, audience: AUDIENCE });
  } catch (err) {
    throw err.name === "TokenExpiredError"
      ? ApiError.unauthorized("Access token expired")
      : ApiError.unauthorized("Invalid access token");
  }
};

export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: String(user._id),
      jti: randomUUID(),
    },
    REFRESH_SECRET(),
    {
      expiresIn: REFRESH_EXPIRY,
      algorithm: "HS256",
      issuer: ISSUER,
      audience: AUDIENCE,
    }
  );
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET(), { issuer: ISSUER, audience: AUDIENCE });
  } catch (err) {
    throw err.name === "TokenExpiredError"
      ? ApiError.unauthorized("Refresh token expired, please log in again")
      : ApiError.unauthorized("Invalid refresh token");
  }
};

export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

export const hashResetToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

export const safeCompareTokenHash = (hashA, hashB) => {
  if (!hashA || !hashB) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(hashA, "hex"), Buffer.from(hashB, "hex"));
  } catch {
    return false;
  }
};

export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};
