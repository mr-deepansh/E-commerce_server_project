import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { User } from "../modules/auth/auth.model.js";

const isRevoked = async (_jti) => false;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required");
    }
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (!payload?.sub || !payload?.jti) {
      throw ApiError.unauthorized("Malformed token payload");
    }
    if (await isRevoked(payload.jti)) {
      throw ApiError.unauthorized("Token has been revoked");
    }
    req.user = {
      id: String(payload.sub),
      role: payload.role,
      jti: payload.jti,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateWithUser = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) =>
      authenticate(req, res, (err) => (err ? reject(err) : resolve()))
    );
    const user = await User.findOne({ _id: req.user.id, isActive: true })
      .select("-password -refreshToken")
      .lean();
    if (!user) {
      throw ApiError.unauthorized("User not found or inactive");
    }
    req.userDoc = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("[authorize] Forbidden — insufficient role", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        method: req.method,
        path: req.path,
      });
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
