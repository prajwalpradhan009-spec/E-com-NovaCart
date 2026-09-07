import jwt from 'jsonwebtoken';
export const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'development-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
export const safeUser = (user) => { const data = user.toJSON ? user.toJSON() : { ...user }; delete data.password; return data; };
