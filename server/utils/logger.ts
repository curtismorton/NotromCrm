import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: "info",
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  } : undefined,
});

// Usage examples:
// logger.info("User logged in", { userId: "123", email: "user@example.com" });
// logger.error("Database connection failed", { error: err.message });
// logger.warn("Rate limit exceeded", { ip: req.ip });
// logger.debug("Debug information", { data: someObject });