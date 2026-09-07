import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired token' }); }
};
export const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ success: false, message: 'Admin access required' });
