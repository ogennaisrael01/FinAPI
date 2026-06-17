import Redis from "ioredis";
import { logger } from "../logger";

function getRedis(){
    const rd = new Redis(process.env.REDIS_URL as string, {maxRetriesPerRequest: null})
    rd.on("connect", () => {
        logger.info("Redis connected successfully")
    })
    rd.on("error", (err) => {
        logger.error("Redis connection error: ", err)
    })
    return rd
}

export const redisClient = getRedis()