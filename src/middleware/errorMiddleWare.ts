import { Request, Response, NextFunction } from "express"
import { logger } from "../logger"
import { AppError, ServerError, ValidationError } from "../errors/AppError";
import { formatErrorResponse } from "../errors/types";

export const ErrorHandleMiddleWare = async (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof AppError){
        logger.warn(err.code, { meta: {status: err.statusCode, message: err.message}})
        return res.status(err.statusCode).json(formatErrorResponse(err))
    }

    logger.error(`Internal server Error: ${err.message}`, {meta: {stack: err.stack}})
    const serverError = new ServerError();
    return res.status(500).json(formatErrorResponse(serverError))
}

export const IdempotencyKeyMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers;
    if (!headers["x-idempotency-key"]){
        throw new ValidationError("Idempotency key is required in headers for payment request")
    }
    next()
}