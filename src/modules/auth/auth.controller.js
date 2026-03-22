// backend/src/modules/auth/auth.controller.js
import apiResponse from "../../utils/apiResponse.js";

export const register = async (req, res) => {
  res.status(201).json(apiResponse.success("User registered successfully", { user: req.user }));
};
