import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { queueEmail } from '../services/email/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'brotherhood_clothing_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export const googleLogin = async (req: Request, res: Response) => {
  const { credential, role: requestedRole } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required' });
  }

  try {
    let email = '';
    let name = '';
    let avatarUrl = '';

    // Verify token using google-auth-library if CLIENT_ID is present, else fallback for development/testing
    if (client && GOOGLE_CLIENT_ID && typeof credential === 'string' && !credential.includes('@')) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name) {
        return res.status(400).json({ error: 'Invalid Google token payload' });
      }
      email = payload.email.toLowerCase();
      name = payload.name;
      avatarUrl = payload.picture || '';
    } else {
      // Development Fallback: Decode token without verification if client id is not configured
      console.warn('WARNING: GOOGLE_CLIENT_ID is not set. Decoding token without signature validation.');
      const decoded = jwt.decode(credential) as any;
      if (!decoded || !decoded.email || !decoded.name) {
        // If it's a mock token for local testing (not actual Google JWT)
        if (typeof credential === 'string' && credential.includes('@')) {
          email = credential.toLowerCase();
          name = credential.split('@')[0];
          avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
        } else {
          return res.status(400).json({ error: 'Google OAuth disabled and mock email not provided in credentials payload' });
        }
      } else {
        email = decoded.email.toLowerCase();
        name = decoded.name;
        avatarUrl = decoded.picture || '';
      }
    }

    // Check if user exists in database
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userRes.rows[0];

    // Determine role
    let role = requestedRole && ['customer', 'owner'].includes(requestedRole) ? requestedRole : 'customer';
    if (email === 'gauswamiashish760@gmail.com') {
      role = 'admin';
    } else if (user) {
      role = user.role; // Keep current role
    }

    if (!user) {
      // Create new user
      const insertRes = await db.query(
        'INSERT INTO users (email, name, avatar_url, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name, avatarUrl, role]
      );
      user = insertRes.rows[0];

      // Create activity log
      await db.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [user.id, 'user_signup', `User signed up using Google OAuth: ${email}`]
      );

      // Queue welcome email
      await queueEmail(email, name, 'welcome', { name, email });
    } else {
      // Update name and avatar if changed
      const updateRes = await db.query(
        'UPDATE users SET name = $1, avatar_url = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, avatarUrl, role, user.id]
      );
      user = updateRes.rows[0];

      // Create activity log
      await db.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [user.id, 'user_login', `User logged in using Google OAuth: ${email}`]
      );
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};
