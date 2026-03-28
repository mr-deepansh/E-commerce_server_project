import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "./apiError.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? "7d";

export const validateJwtSecrets = () => {
  if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw ApiError.internal("JWT secrets are not properly configured");
  }
};
export const signAccessToken = (payload) => {
  if (!ACCESS_SECRET) throw ApiError.internal("JWT access secret is not configured");
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
    algorithm: "HS256",
  });
};
export const verifyAccessToken = (token) => {
  if (!ACCESS_SECRET) throw ApiError.internal("JWT access secret is not configured");
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token has expired");
    }
    throw ApiError.unauthorized("Invalid access token");
  }
};
export const signRefreshToken = (payload) => {
  if (!REFRESH_SECRET) throw ApiError.internal("JWT refresh secret is not configured");
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    algorithm: "HS256",
  });
};
export const verifyRefreshToken = (token) => {
  if (!REFRESH_SECRET) throw ApiError.internal("JWT refresh secret is not configured");
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Refresh token has expired, please log in again");
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
