import { NextFunction, Response,Request } from "express";
import { redisClient } from "../queue/redis.config";

export const Cache = (ttl: number = 60) => async ( req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`
    const cached = await redisClient.get(key)
    if (cached){
        return res.status(200).json(JSON.parse(cached))
    }
    const originalJson = res.json.bind(res);
    res.json = (data) => {
        redisClient.setex(key, ttl, JSON.stringify(data))
        return originalJson(data)
    }
    next();

}