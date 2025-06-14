import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log incoming request
  logger.info(
    {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      ...(req.user && { userId: req.user._id }),
    },
    'Incoming request'
  );

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ...(req.user && { userId: req.user._id }),
      },
      'Request completed'
    );

    return originalEnd(chunk, encoding);
  };

  next();
};
