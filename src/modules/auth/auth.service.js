import { User } from "./auth.model.js";
import ApiError from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";
import {
  generateSecureToken,
  hashToken,
  safeCompareTokenHash,
  signAccessToken,
  signRefreshToken,
} from "../../utils/jwt.utils.js";
import { env } from "../../config/env.js";
import { UserDTO } from "./dto/index.js";

/* ================= HELPER FUNCTIONS ================= */
const buildTokenResponse = (user, accessToken, refreshToken) => ({
  accessToken,
  refreshToken,
  user: UserDTO.from(user),
});

/* ================= SERVICE FUNCTIONS ================= */

export const register = async (data) => {
  const { firstName, lastName, email, username, password, confirmPassword } = data;
  if (password !== confirmPassword) {
    throw ApiError.badRequest("Passwords do not match");
  }
  const conflict = await User.findOne({ $or: [{ email }, { username }] })
    .select("_id email username")
    .lean();
  if (conflict) {
    // Reveal *which* field conflicts so the client can guide the user,
    // but don't leak whether the account already has a password set.
    const field = conflict.email === email ? "email" : "username";
    throw ApiError.conflict(`An account with that ${field} already exists`);
  }
  const { rawToken, hashedToken } = generateSecureToken();
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    isEmailVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  logger.info("auth:register", { userId: user._id, email });
  // TODO: send verification email with rawToken
  return UserDTO.from(user);
};

export const login = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  if (user.isLocked()) {
    throw ApiError.forbidden("Account temporarily locked");
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + env.LOCK_DURATION_MS;
    }
    await user.save();
    throw ApiError.unauthorized("Invalid credentials");
  }
  user.loginAttempts = 0;
  user.lockUntil = null;
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const hashedRefresh = hashToken(refreshToken);
  user.refreshToken = hashedRefresh;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: UserDTO.from(user),
  };
};

export const refreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
  if (!payload?.sub) {
    throw ApiError.unauthorized("Malformed refresh token payload");
  }
  const user = await User.findOne({ _id: payload.sub, isActive: true });
  if (!user) {
    throw ApiError.unauthorized("User not found or inactive");
  }
  const incomingHash = hashToken(rawRefreshToken);
  if (user.refreshToken && user.refreshToken !== incomingHash) {
    await User.findByIdAndUpdate(user._id, { refreshToken: null });
    throw ApiError.unauthorized("Token reuse detected. Please log in again.");
  }
  const accessToken = signAccessToken(user);
  const newRawRefreshToken = signRefreshToken(user);
  const newHashedRefresh = hashToken(newRawRefreshToken);
  await User.findByIdAndUpdate(user._id, { refreshToken: newHashedRefresh });
  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    user: UserDTO.from(user),
  };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
  logger.info("auth:logout", { userId });
};
