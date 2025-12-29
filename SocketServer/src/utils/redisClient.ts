import * as redis from "redis";

import { CoreInterface } from "../types.js";

let redisClient: redis.RedisClientType;

async function init(Core: CoreInterface): Promise<void> {
  try {
    const redisUrl: string = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    redisClient = redis.createClient({
      url: redisUrl,
    });
    redisClient.on("connect", async () => {
      console.log(
        `Redis connected successfuly, running at: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      );
    });
    redisClient.on("error", async () => {
      console.log("Error connecting redis!");
    });
    await redisClient.connect();
  } catch (err: any) {
    Core.logger?.error(
      `RedisClient :: init : ${
        err.message || "Failed to initialize redis client!"
      }`
    );
    throw err;
  }
}

export { redisClient, init };
