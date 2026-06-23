
export class AppError extends Error {
    constructor (
        public statusCode: number, public message: string,
        public code: string, public details: any
    ){
        super (message)
        this.name = this.constructor.name
    }
}

export class ValidationError extends AppError{
    constructor (message: string, details?: any){
        super(400, message, "validation-error", details)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string, details?: any){
        super(401, message, "auth-error", details)
    }
}

export class NotFoundError extends AppError {
    constructor (message: string, details?: any){
        super(404, message, "not-found", details)
    }
}

export class ServerError extends AppError {
    constructor (message?: string, details?: any){
        super(500,  message? message: "server error", "internal-server-error", details)
    }
}

export class RateLimitError extends AppError {
    constructor (message: string, details?: any)
    {
        super (429, message, "rate-limit-exceeede",  details)
    }
}

export class ConflictError extends AppError {
    constructor (message: string, details?: any){
        super(409, message, "conflict-error", details)
    }
}