import apiResponse from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(apiResponse.created(user, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      throw ApiError.badRequest("Missing identifier or password");
    }
    const result = await authService.login(identifier, password);
    res.json(apiResponse.success(result, "Login successful"));
  } catch (error) {
    next(error);
  }
};
