import { User } from "./auth.model.js";
import ApiError from "../../utils/apiError.js";
import { generateResetToken, signAccessToken, signRefreshToken } from "../../utils/jwt.utils.js";
import { env } from "../../config/env.js";

export const register = async (data) => {
  if (!data) {
    throw ApiError.badRequest("Missing registration data");
  }
  const { firstName, lastName, email, username, password, confirmPassword } = data;
  if (password !== confirmPassword) {
    throw ApiError.badRequest("Passwords do not match");
  }
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw ApiError.conflict("User already exists");
  }
  const { rawToken, hashedToken } = generateResetToken();
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    isEmailVerified: false,
    verificationToken: hashedToken,
  });
  // TODO: send verification email with rawToken
  const obj = user.toObject();
  delete obj.password;
  return obj;
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
      user.lockUntil = Date.now() + 15 * 60 * 1000;
    }
    await user.save();
    throw ApiError.unauthorized("Invalid credentials");
  }
  // # Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const obj = user.toObject();
  delete obj.password;
  return { accessToken, refreshToken, user: obj };
};
