import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '@zarishhealthcare/shared-types';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  field?: string;
  validationErrors?: Array<{ field: string; message: string; code: string; value?: any }>;
}

export class ApplicationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public field?: string;

  constructor(message: string, statusCode: number = 500, code?: string, field?: string) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  public validationErrors: Array<{ field: string; message: string; code: string; value?: any }>;

  constructor(
    message: string = 'Validation failed',
    validationErrors: Array<{ field: string; message: string; code: string; value?: any }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
    this.name = 'BadRequestError';
  }
}

export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

export class TooManyRequestsError extends ApplicationError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsError';
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isAppError = 'statusCode' in error && 'isOperational' in error;
  
  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: string | undefined;
  let field: string | undefined;
  let validationErrors: Array<{ field: string; message: string; code: string; value?: any }> | undefined;

  // Handle known application errors
  if (isAppError) {
    const appError = error as AppError;
    statusCode = appError.statusCode;
    errorCode = appError.code || 'APPLICATION_ERROR';
    message = appError.message;
    field = appError.field;

    if (appError instanceof ValidationError) {
      validationErrors = appError.validationErrors;
    }
  }

  // Handle specific database errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_CONSTRAINT';
    message = 'Referenced resource does not exist';
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON payload';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Handle MongoDB/Mongoose errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource ID';
  }

  // Handle PostgreSQL errors
  if (error.name === 'QueryFailedError' || (error as any).code?.startsWith?.('23')) {
    statusCode = 400;
    errorCode = 'DATABASE_ERROR';
    
    const pgError = error as any;
    switch (pgError.code) {
      case '23505': // Unique violation
        statusCode = 409;
        errorCode = 'DUPLICATE_ENTRY';
        message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        errorCode = 'FOREIGN_KEY_CONSTRAINT';
        message = 'Referenced resource does not exist';
        break;
      case '23502': // Not null violation
        errorCode = 'REQUIRED_FIELD_MISSING';
        message = 'Required field is missing';
        break;
      default:
        message = 'Database operation failed';
    }
  }

  // In development, include error details and stack trace
  if (process.env.NODE_ENV === 'development') {
    details = error.message;
  }

  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Request error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      errorCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
    },
  });

  // Prepare error response
  const errorResponse: ApiResponse<never> = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
      field,
      validationErrors,
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'unknown',
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ApiResponse<never> = {
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'The requested endpoint was not found',
      details: `${req.method} ${req.originalUrl} is not supported`,
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'unknown',
  };

  logger.warn('404 - Endpoint not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json(errorResponse);
};

// Request timeout handler
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request timeout',
            details: `Request took longer than ${timeoutMs}ms`,
          },
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        };

        logger.warn('Request timeout', {
          method: req.method,
          url: req.originalUrl,
          timeout: timeoutMs,
          ip: req.ip,
        });

        res.status(408).json(errorResponse);
      }
    }, timeoutMs);

    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Unhandled error handler for async routes
export const unhandledErrorHandler = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack,
    });
    
    // Exit gracefully
    process.exit(1);
  });
};

export {
  ApplicationError as AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  ServiceUnavailableError,
  TooManyRequestsError,
};