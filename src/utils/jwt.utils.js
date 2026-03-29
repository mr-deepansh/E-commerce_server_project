import jwt from "jsonwebtoken";
import crypto from "crypto";
import { randomUUID } from "crypto";
import ApiError from "./apiError.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? "7d";
const ISSUER = "your-app";
const AUDIENCE = "your-app-users";

export const validateJwtSecrets = () => {
  if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw ApiError.internal("JWT secrets are not properly configured");
  }
};

export const signAccessToken = (user) => {
  if (!ACCESS_SECRET) throw ApiError.internal("JWT access secret is not configured");
  const payload = {
    sub: user._id,
    role: user.role,
    jti: randomUUID(),
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
    algorithm: "HS256",
    issuer: ISSUER,
    audience: AUDIENCE,
  });
};

export const verifyAccessToken = (token) => {
  if (!ACCESS_SECRET) throw ApiError.internal("JWT access secret is not configured");
  try {
    return jwt.verify(token, ACCESS_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token expired, please refresh");
    }
    throw ApiError.unauthorized("Invalid access token");
  }
};

export const signRefreshToken = (user) => {
  if (!REFRESH_SECRET) throw ApiError.internal("JWT refresh secret is not configured");
  const payload = {
    sub: user._id,
    jti: randomUUID(),
  };
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    algorithm: "HS256",
    issuer: ISSUER,
    audience: AUDIENCE,
  });
};

export const verifyRefreshToken = (token) => {
  if (!REFRESH_SECRET) throw ApiError.internal("JWT refresh secret is not configured");
  try {
    return jwt.verify(token, REFRESH_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Refresh token expired, login again");
    }
    throw ApiError.unauthorized("Invalid refresh token");
  }
};

export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashResetToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");
