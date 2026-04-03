import BaseDTO from "../../../common/dto/base.dto.js";
import { z } from "zod";

class RefreshTokenDTO extends BaseDTO {
  static schema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  });
}

export default RefreshTokenDTO;
