import { Request, Response, NextFunction } from "express"
import { logger } from "../logger"

export const baseError = async (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${req.method} - ${req.url} - ${err.message}`, {error: err})
    
    return res.status(500).json({error: err.message})
}

export const IdempotencyKeyMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers;
    if (!headers["x-idempotency-key"]){
        return res.status(400).json({errors: "Idempotency key is required in headers for payment request"})
    }
    next()
}