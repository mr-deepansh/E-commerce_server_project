import BaseDTO from "../../../common/dto/base.dto.js";
import { z } from "zod";

class UserDTO extends BaseDTO {
  static schema = z.object({
    _id: z.string(),
    firstName: z.string(),
    lastName: z.string().optional(),
    email: z.string().email(),
    username: z.string(),
    role: z.enum(["customer", "seller", "admin"]),
    isEmailVerified: z.boolean(),
    isActive: z.boolean(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

  static from(user) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : user;
    return {
      _id: obj._id?.toString(),
      firstName: obj.firstName,
      lastName: obj.lastName,
      email: obj.email,
      username: obj.username,
      role: obj.role,
      isEmailVerified: obj.isEmailVerified,
      isActive: obj.isActive,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}

export default UserDTO;
