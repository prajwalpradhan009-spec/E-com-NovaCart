require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query } = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "novacart-development-secret-change-me";

function signToken(user) {
  return jwt.sign(
    { sub: String(user.id), id: String(user.id), role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: Number(user.id),
    name: user.full_name || user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "India",
    picture: user.avatar_url || user.picture || "",
    gender: user.gender || "",
    bio: user.bio || "",
    role: user.role || "customer",
    memberSince: isoDate(user.created_at || user.createdAt)
  };
}

async function findUserById(id) {
  const rows = await query(
    `SELECT id, full_name, email, password_hash, phone, avatar_url, gender, bio, location, role, is_active, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

async function authRequired(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required" });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  try {
    const id = payload.sub || payload.id;
    const user = await findUserById(id);
    if (!user || !Number(user.is_active)) return res.status(401).json({ error: "Invalid session" });
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

async function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return next();

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return next();
  }

  try {
    const user = await findUserById(payload.sub || payload.id);
    if (user && Number(user.is_active)) req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required" });
  }
  return next();
}

module.exports = {
  JWT_SECRET,
  signToken,
  hashPassword,
  verifyPassword,
  sanitizeUser,
  findUserById,
  authRequired,
  optionalAuth,
  requireAdmin
};
