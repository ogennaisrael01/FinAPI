import { AppError } from "./AppError"


export interface ErrorResponse {
    succes: false, 
    error: {
        code: string, message: string, statusCode: number,
        details?: any, timestamp: string
    }
    
}

export function formatErrorResponse(error: AppError): ErrorResponse {
    return {
        succes: false, 
        error: {
            code: error.code, message: error.message, 
            statusCode: error.statusCode, details: error.details,
            timestamp: new Date().toISOString()
        }
    }
};
