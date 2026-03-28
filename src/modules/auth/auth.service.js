import bcrypt from "bcrypt";
import { User } from "./auth.model.js";
import ApiError from "../../utils/apiError.js";
import { generateResetToken, signAccessToken, signRefreshToken } from "../../utils/jwt.utils.js";
import { env } from "../../config/env.js";

export const register = async (data) => {
  if (!data) {
    throw ApiError.badRequest("Missing registration data");
  }
  const { firstName, lastName, email, username, password } = data;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw ApiError.conflict("User already exists");
  }
  const saltRounds = env.BCRYPT_SALT_ROUNDS;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const { rawToken, hashedToken } = generateResetToken();
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    verificationToken: hashedToken,
  });
  // TODO: send verification email with rawToken

  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

export const login = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return { accessToken, refreshToken, user: userObject };
};
