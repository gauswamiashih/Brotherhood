import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'brotherhood_clothing_secret_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'customer' | 'owner' | 'admin';
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

import { db } from '../config/db';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    // Verify status in DB (security check)
    const userRes = await db.query('SELECT status, role FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'User account not found' });
    }
    const dbUser = userRes.rows[0];
    if (dbUser.status === 'suspended' || dbUser.status === 'blocked') {
      return res.status(403).json({ error: `Your account has been ${dbUser.status}. Contact administrator.` });
    }
    
    // Sync current role (in case it was promoted to owner)
    decoded.role = dbUser.role;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: Array<'customer' | 'owner' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Double check admin role and specifically verify founder email address
  if (req.user.role !== 'admin' || req.user.email !== 'gauswamiashish760@gmail.com') {
    return res.status(403).json({ error: 'Access forbidden: Founder Admin access required' });
  }

  next();
};
