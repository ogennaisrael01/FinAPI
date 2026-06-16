import { Request, Response, NextFunction } from "express"
import { logger } from "../logger"

export const baseError = async (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${req.method} - ${req.url} - ${err.message}`, {error: err})
    
    return res.status(500).json({error: err.message})
}