import BaseDTO from "../../../common/dto/base.dto.js";
import { z } from "zod";

class VerifyEmailDTO extends BaseDTO {
  static schema = z.object({
    token: z.string().min(1, "Verification token is required"),
  });
}

export default VerifyEmailDTO;
