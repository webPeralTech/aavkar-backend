import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from './auth';

export const isAdmin = [
  authenticate,
  authorize('admin')
]; 