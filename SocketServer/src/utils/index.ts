import { CoreInterface } from "../types.js";
import * as logger from "./logger.js";
import * as redis from "./redisClient.js";

async function init(Core: CoreInterface) {
  try {
    await logger.init(Core);
    Core.logger = logger.logger;

    await redis.init(Core);
    Core.redis = redis.redisClient;
  } catch (err) {
    console.error(`Utils :: init : ${err}`);
    throw err;
  }
}

export { init };
