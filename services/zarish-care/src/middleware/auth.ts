import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { AuthTypes } from '@zarishhealthcare/shared-types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTypes.SessionUser;
      organization?: AuthTypes.Organization;
      project?: AuthTypes.Project;
    }
  }
}

interface TokenPayload extends JwtPayload {
  userId: string;
  organizationId: string;
  projectId?: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  type: 'access' | 'refresh';
}

export class AuthMiddleware {
  private jwtSecret: string;
  private redisClient: any; // Will be injected

  constructor(jwtSecret: string, redisClient?: any) {
    this.jwtSecret = jwtSecret;
    this.redisClient = redisClient;
  }

  // Basic JWT authentication
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authentication token required');
      }

      const token = authHeader.substring(7);
      
      // Verify JWT token
      const decoded = verify(token, this.jwtSecret) as TokenPayload;
      
      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      // Check if session is still valid (if Redis is available)
      if (this.redisClient) {
        const sessionKey = `session:${decoded.sessionId}`;
        const sessionData = await this.redisClient.get(sessionKey);
        
        if (!sessionData) {
          throw new UnauthorizedError('Session expired or invalid');
        }

        const session = JSON.parse(sessionData);
        if (session.userId !== decoded.userId) {
          throw new UnauthorizedError('Session user mismatch');
        }
      }

      // Set user information on request
      req.user = {
        id: decoded.userId,
        organizationId: decoded.organizationId,
        projectId: decoded.projectId,
        roles: decoded.roles,
        permissions: decoded.permissions,
        sessionId: decoded.sessionId,
      };

      logger.info('User authenticated', {
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        projectId: decoded.projectId,
        roles: decoded.roles,
        sessionId: decoded.sessionId,
      });

      next();
    } catch (error) {
      if (error instanceof Error) {
        logger.warn('Authentication failed', {
          error: error.message,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
        });

        if (error.name === 'TokenExpiredError') {
          next(new UnauthorizedError('Authentication token has expired'));
        } else if (error.name === 'JsonWebTokenError') {
          next(new UnauthorizedError('Invalid authentication token'));
        } else {
          next(error);
        }
      } else {
        next(new UnauthorizedError('Authentication failed'));
      }
    }
  };

  // Optional authentication - sets user if token is provided but doesn't require it
  optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
      }

      // Use the authenticate middleware logic
      await this.authenticate(req, res, next);
    } catch (error) {
      // For optional auth, we continue even if auth fails
      logger.debug('Optional authentication failed, continuing', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
      });
      next();
    }
  };

  // Require specific roles
  requireRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      const userRoles = req.user.roles || [];
      const hasRequiredRole = allowedRoles.some(role => 
        userRoles.includes(role) || userRoles.includes('super_admin')
      );

      if (!hasRequiredRole) {
        logger.warn('Access denied - insufficient roles', {
          userId: req.user.id,
          userRoles,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        return next(new ForbiddenError('Insufficient permissions'));
      }

      next();
    };
  };

  // Require specific permissions
  requirePermissions = (requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      const userPermissions = req.user.permissions || [];
      const userRoles = req.user.roles || [];

      // Super admin has all permissions
      if (userRoles.includes('super_admin')) {
        return next();
      }

      const hasRequiredPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        logger.warn('Access denied - insufficient permissions', {
          userId: req.user.id,
          userPermissions,
          requiredPermissions,
          path: req.path,
        });

        return next(new ForbiddenError('Insufficient permissions'));
      }

      next();
    };
  };

  // Require organization access
  requireOrganization = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const organizationId = req.params.organizationId || req.body.organizationId;
    
    if (!organizationId) {
      return next(new ForbiddenError('Organization context required'));
    }

    // Check if user belongs to the organization
    if (req.user.organizationId !== organizationId && !req.user.roles.includes('super_admin')) {
      logger.warn('Access denied - organization mismatch', {
        userId: req.user.id,
        userOrgId: req.user.organizationId,
        requestedOrgId: organizationId,
        path: req.path,
      });

      return next(new ForbiddenError('Access to organization not allowed'));
    }

    next();
  };

  // Require project access
  requireProject = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return next(new ForbiddenError('Project context required'));
    }

    // Super admin can access any project
    if (req.user.roles.includes('super_admin')) {
      return next();
    }

    // Check if user has access to the project
    if (req.user.projectId !== projectId) {
      logger.warn('Access denied - project mismatch', {
        userId: req.user.id,
        userProjectId: req.user.projectId,
        requestedProjectId: projectId,
        path: req.path,
      });

      return next(new ForbiddenError('Access to project not allowed'));
    }

    next();
  };

  // API Key authentication (for service-to-service communication)
  authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        throw new UnauthorizedError('API key required');
      }

      // Check API key validity (if Redis is available)
      if (this.redisClient) {
        const keyData = await this.redisClient.get(`api_key:${apiKey}`);
        
        if (!keyData) {
          throw new UnauthorizedError('Invalid API key');
        }

        const keyInfo = JSON.parse(keyData);
        
        if (keyInfo.expiresAt && new Date(keyInfo.expiresAt) < new Date()) {
          throw new UnauthorizedError('API key expired');
        }

        if (!keyInfo.active) {
          throw new UnauthorizedError('API key deactivated');
        }

        // Set service context
        req.user = {
          id: keyInfo.serviceId,
          organizationId: keyInfo.organizationId,
          roles: ['service'],
          permissions: keyInfo.permissions || [],
          sessionId: `api_key_${apiKey.substring(0, 8)}`,
        };

        logger.info('Service authenticated via API key', {
          serviceId: keyInfo.serviceId,
          organizationId: keyInfo.organizationId,
          permissions: keyInfo.permissions,
        });
      }

      next();
    } catch (error) {
      logger.warn('API key authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip,
        path: req.path,
      });
      next(error);
    }
  };

  // Rate limiting per user
  rateLimitPerUser = (maxRequests: number = 100, windowMs: number = 60000) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.redisClient || !req.user) {
        return next();
      }

      const userId = req.user.id;
      const key = `rate_limit:user:${userId}`;
      
      try {
        const current = await this.redisClient.incr(key);
        
        if (current === 1) {
          await this.redisClient.expire(key, Math.ceil(windowMs / 1000));
        }

        if (current > maxRequests) {
          logger.warn('Rate limit exceeded for user', {
            userId,
            current,
            maxRequests,
            path: req.path,
          });

          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests',
            },
            timestamp: new Date(),
          });
        }

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, maxRequests - current).toString(),
          'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
        });

        next();
      } catch (error) {
        logger.error('Rate limiting error', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        next(); // Continue on Redis errors
      }
    };
  };
}

// Default instance (will be configured in app setup)
let authMiddleware: AuthMiddleware;

export const initializeAuth = (jwtSecret: string, redisClient?: any) => {
  authMiddleware = new AuthMiddleware(jwtSecret, redisClient);
  return authMiddleware;
};

export const getAuthMiddleware = () => {
  if (!authMiddleware) {
    throw new Error('Auth middleware not initialized');
  }
  return authMiddleware;
};

// Export individual middleware functions for convenience
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  return getAuthMiddleware().authenticate(req, res, next);
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  return getAuthMiddleware().optionalAuth(req, res, next);
};

export const requireRoles = (roles: string[]) => {
  return getAuthMiddleware().requireRoles(roles);
};

export const requirePermissions = (permissions: string[]) => {
  return getAuthMiddleware().requirePermissions(permissions);
};

export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  return getAuthMiddleware().requireOrganization(req, res, next);
};

export const requireProject = (req: Request, res: Response, next: NextFunction) => {
  return getAuthMiddleware().requireProject(req, res, next);
};

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  return getAuthMiddleware().authenticateApiKey(req, res, next);
};

export const rateLimitPerUser = (maxRequests?: number, windowMs?: number) => {
  return getAuthMiddleware().rateLimitPerUser(maxRequests, windowMs);
};

export default AuthMiddleware;