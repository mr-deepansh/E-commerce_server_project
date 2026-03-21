import morgan from "morgan";
import { logger } from "./logger.js";

const ENV = process.env.NODE_ENV;

// stream → winston
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// custom format (clean + useful)
const format =
    ":method :url :status :response-time ms - :res[content-length]";
const skip = (req, res) => {
    if (req.url === "/") return true;
    if (ENV === "production") {
        return res.statusCode < 400;
    }
    return false;
};

export const morganMiddleware = morgan(format, {
    stream,
    skip
});