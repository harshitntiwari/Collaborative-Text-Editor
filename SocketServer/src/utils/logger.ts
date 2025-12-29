import winston from "winston";

import { CoreInterface } from "../types.js";

let logger: winston.Logger;

async function init(Core: CoreInterface): Promise<void> {
  try {
    const { combine, timestamp, json, colorize } = winston.format;
    logger = winston.createLogger({
      level: "info",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        json(),
        colorize()
      ),
      defaultMeta: { service: "socket-server" },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: "app.log",
        }),
      ],
    });
  } catch (err) {
    console.error("Failed to initialize logger!");
    throw err;
  }
}

export { init, logger };
