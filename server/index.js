require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { connect, query, withTransaction, close } = require("./db");
const {
  signToken,
  hashPassword,
  verifyPassword,
  sanitizeUser,
  findUserById,
  authRequired,
  optionalAuth,
  requireAdmin
} = require("./auth");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has("*") || allowedOrigins.has(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed"));
  }
}));
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const PRODUCT_SELECT = `
  SELECT
    p.id AS product_id,
    p.category_id AS product_category_id,
    p.sku AS sku,
    p.slug AS slug,
    p.name AS name,
    p.brand AS brand,
    p.short_description AS short_description,
    p.description AS description,
    p.price AS price,
    p.compare_at_price AS compare_at_price,
    p.stock_quantity AS stock_quantity,
    p.low_stock_threshold AS low_stock_threshold,
    p.rating_average AS rating_average,
    p.review_count AS review_count,
    p.badge AS badge,
    p.is_featured AS is_featured,
    p.is_deal AS is_deal,
    p.status AS status,
    p.art_key AS art_key,
    p.accent_color AS accent_color,
    (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order, pi.id LIMIT 1) AS primary_image,
    p.features AS features,
    p.specifications AS specifications,
    p.tags AS tags,
    p.shipping_message AS shipping_message,
    p.created_at AS created_at,
    p.updated_at AS updated_at,
    c.id AS category_database_id,
    c.slug AS category_slug,
    c.name AS category_name
  FROM products p
  JOIN categories c ON c.id = p.category_id`;

const CATEGORY_SELECT = `
  SELECT
    c.id AS category_id,
    c.parent_id AS category_parent_id,
    c.name AS name,
    c.slug AS slug,
    c.description AS description,
    c.icon_key AS icon_key,
    c.accent_color AS accent_color,
    c.sort_order AS sort_order,
    c.is_active AS is_active,
    c.created_at AS created_at,
    c.updated_at AS updated_at,
    parent.slug AS parent_slug,
    (SELECT COUNT(*) FROM products pcount WHERE pcount.category_id = c.id AND pcount.status = 'active') AS product_count
  FROM categories c
  LEFT JOIN categories parent ON parent.id = c.parent_id`;

const REVIEW_SELECT = `
  SELECT
    r.id AS review_id,
    r.user_id AS user_id,
    r.product_id AS product_id,
    r.order_id AS order_id,
    r.rating AS rating,
    r.title AS title,
    r.comment AS comment,
    r.status AS review_status,
    r.verified_purchase AS verified_purchase,
    r.helpful_count AS helpful_count,
    r.location AS location,
    r.created_at AS created_at,
    r.updated_at AS updated_at,
    u.full_name AS user_name,
    u.avatar_url AS user_avatar_url
  FROM reviews r
  JOIN users u ON u.id = r.user_id`;

const ORDER_SELECT = `
  SELECT
    o.id AS order_id,
    o.order_number AS order_number,
    o.user_id AS user_id,
    o.cart_id AS cart_id,
    o.status AS order_status,
    o.subtotal AS subtotal,
    o.discount_total AS discount_total,
    o.shipping_total AS shipping_total,
    o.tax_total AS tax_total,
    o.total_amount AS total_amount,
    o.currency_code AS currency_code,
    o.shipping_address AS shipping_address,
    o.billing_address AS billing_address,
    o.notes AS notes,
    o.placed_at AS placed_at,
    o.created_at AS created_at,
    o.updated_at AS updated_at,
    u.full_name AS user_full_name,
    u.email AS user_email,
    u.phone AS user_phone
  FROM orders o
  LEFT JOIN users u ON u.id = o.user_id`;

const ORDER_STATUS_DISPLAY = {
  pending: "Processing",
  confirmed: "Processing",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

const PAYMENT_METHOD_LABELS = {
  card: "Credit / Debit Card",
  upi: "UPI",
  net_banking: "Net Banking",
  wallet: "Wallet",
  cash_on_delivery: "Cash on Delivery",
  other: "Other"
};

const PRODUCT_STATUS = new Set(["draft", "active", "archived"]);
const ORDER_STATUS = new Set(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]);
const PRODUCT_SORT = {
  featured: "p.is_featured DESC, p.created_at DESC, p.id ASC",
  popular: "p.review_count DESC, p.rating_average DESC, p.id ASC",
  rating: "p.rating_average DESC, p.review_count DESC, p.id ASC",
  "price-asc": "p.price ASC, p.id ASC",
  "price-desc": "p.price DESC, p.id ASC"
};

const defaultSettings = {
  storeName: "NovaCart",
  supportEmail: "hello@novacart.in",
  supportPhone: "+91 98765 43210",
  currency: "INR (₹)",
  freeShippingAbove: "999",
  expressFee: "149",
  dealsEndAt: "2026-09-30T23:59:59.000Z",
  taxRate: "0",
  lowStockAlert: "10",
  maintenanceMode: false,
  orderAlerts: true,
  lowStockAlerts: true,
  digest: false
};
let runtimeSettings = { ...defaultSettings };

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function cleanText(value, maxLength = 1000) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
}

function requiredText(value, label, maxLength) {
  const text = cleanText(value, maxLength + 1);
  if (!text) throw httpError(400, `${label} is required`);
  if (text.length > maxLength) throw httpError(400, `${label} is too long`);
  return text;
}

function optionalText(value, maxLength) {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value).trim();
  if (text.length > maxLength) throw httpError(400, `Value is too long for a ${maxLength}-character field`);
  return text;
}

function money(value, label = "Value") {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw httpError(400, `${label} must be a non-negative number`);
  return Math.round(number * 100) / 100;
}

function integer(value, label, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw httpError(400, `${label} must be an integer between ${min} and ${max}`);
  }
  return number;
}

function booleanValue(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function isoDate(value, fallback = new Date()) {
  const date = value ? new Date(value) : fallback;
  return Number.isNaN(date.getTime()) ? new Date(fallback).toISOString() : date.toISOString();
}

function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) value = value.toString("utf8");
  if (typeof value === "object") return value;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function jsonArray(value, label = "Value") {
  const parsed = parseJson(value, []);
  if (!Array.isArray(parsed)) throw httpError(400, `${label} must be an array`);
  return parsed.map((item) => cleanText(item, 200)).filter(Boolean);
}

function jsonObject(value, label = "Value") {
  const parsed = parseJson(value, {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw httpError(400, `${label} must be an object`);
  return parsed;
}

function jsonString(value) {
  return JSON.stringify(value);
}

function slugify(value) {
  return cleanText(value, 250)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 180);
}

function validColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function orderNumber() {
  return `NC-${new Date().getUTCFullYear()}-${crypto.randomInt(100000, 1000000)}`;
}

function settingNumber(key, fallback) {
  const number = Number(runtimeSettings[key]);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function dealsEnd() {
  const value = runtimeSettings.dealsEndAt || defaultSettings.dealsEndAt;
  const parsed = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(parsed.getTime()) ? defaultSettings.dealsEndAt : parsed.toISOString();
}

function run(executor, sql, params = []) {
  return executor.execute(sql, params).then(([rows]) => rows);
}

async function findCategoryRow(executor, idOrSlug) {
  const rows = await run(
    executor,
    `${CATEGORY_SELECT} WHERE c.id = ? OR c.slug = ? LIMIT 1`,
    [idOrSlug, idOrSlug]
  );
  return rows[0] || null;
}

async function findProductRow(executor, idOrSlug, includeInactive = true) {
  const statusClause = includeInactive ? "" : " AND p.status = 'active'";
  const rows = await run(
    executor,
    `${PRODUCT_SELECT} WHERE (p.id = ? OR p.slug = ?)${statusClause} LIMIT 1`,
    [idOrSlug, idOrSlug]
  );
  return rows[0] || null;
}

function mapCategory(row) {
  return {
    id: row.slug,
    databaseId: Number(row.category_id),
    parentId: row.parent_slug || (row.category_parent_id ? String(row.category_parent_id) : null),
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    iconKey: row.icon_key || "box",
    art: row.icon_key || "box",
    accent: row.accent_color || "#2563EB",
    accentColor: row.accent_color || "#2563EB",
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(Number(row.is_active)),
    productCount: Number(row.product_count || 0),
    createdAt: isoDate(row.created_at),
    updatedAt: isoDate(row.updated_at)
  };
}

function mapProduct(row, images = []) {
  const reviewCount = Number(row.review_count || 0);
  const mrp = row.compare_at_price === null || row.compare_at_price === undefined ? null : money(row.compare_at_price);
  const price = money(row.price);
  const image = row.primary_image || images.find((item) => item.path)?.path || "";
  return {
    id: String(row.product_id),
    databaseId: Number(row.product_id),
    category: row.category_name || "",
    categoryId: row.category_slug || "",
    categoryName: row.category_name || "",
    slug: row.slug,
    name: row.name,
    brand: row.brand || "",
    description: row.short_description || "",
    shortDescription: row.short_description || "",
    longDescription: row.description || "",
    price,
    mrp,
    originalPrice: mrp,
    compareAtPrice: mrp,
    discount: mrp ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0,
    stock: Number(row.stock_quantity || 0),
    lowStockThreshold: Number(row.low_stock_threshold || 0),
    rating: money(row.rating_average || 0),
    reviewCount,
    reviews: reviewCount,
    image,
    badge: row.badge || null,
    featured: Boolean(Number(row.is_featured)),
    isFeatured: Boolean(Number(row.is_featured)),
    deal: Boolean(Number(row.is_deal)),
    status: row.status,
    art: row.art_key || "box",
    artKey: row.art_key || "box",
    accent: row.accent_color || "#2563EB",
    accentColor: row.accent_color || "#2563EB",
    features: parseJson(row.features, []),
    specs: parseJson(row.specifications, {}),
    specifications: parseJson(row.specifications, {}),
    tags: parseJson(row.tags, []),
    shipping: row.shipping_message || "Ships in 2-4 business days. Free delivery on orders above INR 999.",
    shippingMessage: row.shipping_message || "Ships in 2-4 business days. Free delivery on orders above INR 999.",
    images,
    createdAt: isoDate(row.created_at),
    updatedAt: isoDate(row.updated_at)
  };
}

function mapReview(row) {
  return {
    id: String(row.review_id),
    productId: String(row.product_id),
    user: row.user_name || "Guest",
    rating: Number(row.rating || 0),
    title: row.title || "",
    comment: row.comment || "",
    date: isoDate(row.created_at),
    verified: Boolean(Number(row.verified_purchase)),
    status: row.review_status,
    location: row.location || "India",
    helpfulCount: Number(row.helpful_count || 0)
  };
}

function mapAddress(value) {
  const source = parseJson(value, {}) || {};
  return {
    recipientName: source.recipientName || source.name || "",
    phone: source.phone || "",
    email: source.email || "",
    line: source.line || source.line1 || "",
    line1: source.line1 || source.line || "",
    line2: source.line2 || "",
    city: source.city || "",
    state: source.state || source.stateRegion || "",
    stateRegion: source.stateRegion || source.state || "",
    pincode: source.pincode || source.postalCode || "",
    postalCode: source.postalCode || source.pincode || "",
    countryCode: source.countryCode || "IN"
  };
}

function mapPayment(payment) {
  if (!payment) return { method: "Not available", status: "pending", reference: "" };
  return {
    method: PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method || "Other",
    status: payment.status || "pending",
    reference: payment.provider_payment_id || ""
  };
}

function mapOrder(row, items = [], payment = null) {
  const address = mapAddress(row.shipping_address);
  const customerName = row.user_full_name || address.recipientName || "Guest";
  const customerEmail = row.user_email || address.email || "";
  const customerPhone = row.user_phone || address.phone || "";
  const shippingTotal = money(row.shipping_total || 0);
  return {
    id: row.order_number,
    databaseId: Number(row.order_id),
    userId: row.user_id === null || row.user_id === undefined ? null : String(row.user_id),
    status: ORDER_STATUS_DISPLAY[row.order_status] || "Processing",
    databaseStatus: row.order_status,
    createdAt: isoDate(row.placed_at || row.created_at),
    subtotal: money(row.subtotal || 0),
    shipping: shippingTotal,
    tax: money(row.tax_total || 0),
    discount: money(row.discount_total || 0),
    total: money(row.total_amount || 0),
    customer: { name: customerName, email: customerEmail, phone: customerPhone },
    address,
    delivery: {
      method: shippingTotal >= 299 ? "Same-day" : shippingTotal > 0 ? "Express (1–2 days)" : "Standard (3–5 days)",
      fee: shippingTotal
    },
    payment: mapPayment(payment),
    items: items.map((item) => ({
      id: String(item.item_id),
      productId: String(item.product_id),
      name: item.product_name,
      price: money(item.unit_price || 0),
      qty: Number(item.quantity || 0),
      image: item.image_path || "",
      art: item.art_key || "box",
      accent: item.accent_color || "#2563EB"
    })),
    notes: row.notes || ""
  };
}

function mapReviewSelect(row) {
  return mapReview(row);
}

async function loadOrderRows(executor, whereSql = "", params = [], limit = null) {
  let sql = `${ORDER_SELECT} ${whereSql ? `WHERE ${whereSql}` : ""} ORDER BY o.placed_at DESC, o.id DESC`;
  if (limit !== null) sql += ` LIMIT ${Math.max(1, Math.min(100, Math.floor(limit)))}`;
  const orders = await run(executor, sql, params);
  if (!orders.length) return [];

  const ids = orders.map((row) => row.order_id);
  const placeholders = ids.map(() => "?").join(", ");
  const itemRows = await run(
    executor,
    `SELECT
       oi.id AS item_id,
       oi.order_id AS order_id,
       oi.product_id AS product_id,
       oi.product_name AS product_name,
       oi.unit_price AS unit_price,
       oi.quantity AS quantity,
       p.art_key AS art_key,
       p.accent_color AS accent_color,
       (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY pi.is_primary DESC, pi.sort_order, pi.id LIMIT 1) AS image_path
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.id ASC`,
    ids
  );
  const paymentRows = await run(
    executor,
    `SELECT id AS payment_id, order_id, provider_payment_id, payment_method, status
     FROM payments
     WHERE order_id IN (${placeholders})
     ORDER BY id DESC`,
    ids
  );
  const itemsByOrder = new Map();
  for (const item of itemRows) {
    const key = String(item.order_id);
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(item);
  }
  const paymentByOrder = new Map();
  for (const payment of paymentRows) {
    const key = String(payment.order_id);
    if (!paymentByOrder.has(key)) paymentByOrder.set(key, payment);
  }
  return orders.map((row) => mapOrder(row, itemsByOrder.get(String(row.order_id)) || [], paymentByOrder.get(String(row.order_id)) || null));
}

async function getOrderDetails(executor, identifier) {
  const rows = await loadOrderRows(executor, "o.order_number = ? OR CAST(o.id AS CHAR) = ?", [identifier, identifier], 1);
  return rows[0] || null;
}

async function getProductResponse(executor, identifier, includeInactive = true) {
  const row = await findProductRow(executor, identifier, includeInactive);
  if (!row) return null;
  const imageRows = await run(
    executor,
    `SELECT image_path, alt_text, width, height, sort_order, is_primary
     FROM product_images WHERE product_id = ? ORDER BY sort_order, id`,
    [row.product_id]
  );
  return mapProduct(row, imageRows.map((image) => ({
    path: image.image_path,
    alt: image.alt_text,
    width: image.width,
    height: image.height,
    sortOrder: Number(image.sort_order || 0),
    primary: Boolean(Number(image.is_primary))
  })));
}

function deliveryInfo(value) {
  const text = String((value && typeof value === "object" ? value.id || value.method : value) || "standard").toLowerCase();
  if (text.includes("same")) return { id: "same-day", label: "Same-day", fee: 299 };
  if (text.includes("express")) return { id: "express", label: "Express (1–2 days)", fee: settingNumber("expressFee", 149) };
  return { id: "standard", label: "Standard (3–5 days)", fee: 0 };
}

function paymentMethod(value) {
  const text = String((value && typeof value === "object" ? value.id || value.method : value) || "other").toLowerCase();
  if (text.includes("cash") || text === "cod") return "cash_on_delivery";
  if (text.includes("net") || text.includes("bank")) return "net_banking";
  if (text.includes("card")) return "card";
  if (text.includes("upi")) return "upi";
  if (text.includes("wallet")) return "wallet";
  return "other";
}

function buildOrderAddress(address, customer) {
  const source = address && typeof address === "object" ? address : {};
  const line = requiredText(firstDefined(source.line, source.line1, source.address), "Address", 255);
  const city = requiredText(source.city, "City", 100);
  const state = requiredText(firstDefined(source.state, source.stateRegion), "State", 100);
  const pincode = requiredText(firstDefined(source.pincode, source.postalCode), "PIN code", 20);
  const countryCode = cleanText(firstDefined(source.countryCode, "IN"), 2).toUpperCase() || "IN";
  return {
    recipientName: cleanText(firstDefined(source.recipientName, source.name, customer.name), 120),
    phone: cleanText(firstDefined(source.phone, customer.phone), 25),
    email: cleanText(customer.email, 254).toLowerCase(),
    line,
    line1: line,
    line2: optionalText(source.line2, 255) || "",
    city,
    state,
    stateRegion: state,
    postalCode: pincode,
    pincode,
    countryCode
  };
}

function productFields(body, current = null) {
  const fields = {};
  const creating = !current;
  if (creating || hasOwn(body, "name")) {
    const name = requiredText(body.name, "Product name", 200);
    fields.name = name;
    if (!hasOwn(body, "slug") || body.slug === "") fields.slug = slugify(name);
  }
  if (hasOwn(body, "slug")) {
    const slug = slugify(body.slug);
    if (!slug) throw httpError(400, "Product slug is invalid");
    fields.slug = slug;
  }
  if (creating || hasOwn(body, "categoryId") || hasOwn(body, "category_id")) {
    fields.categoryInput = firstDefined(body.categoryId, body.category_id);
  }
  if (creating || hasOwn(body, "description") || hasOwn(body, "shortDescription")) {
    const description = cleanText(firstDefined(body.shortDescription, body.description), 501);
    if (!description) throw httpError(400, "Product description is required");
    if (description.length > 500) throw httpError(400, "Product description is too long");
    fields.short_description = description;
  }
  if (creating || hasOwn(body, "longDescription") || hasOwn(body, "long_description")) {
    const description = cleanText(firstDefined(body.longDescription, body.long_description, body.description, body.shortDescription), 50000);
    if (!description) throw httpError(400, "Product long description is required");
    fields.description = description;
  }
  if (creating || hasOwn(body, "price")) {
    fields.price = money(firstDefined(body.price), "Price");
  }
  if (creating || hasOwn(body, "originalPrice") || hasOwn(body, "compareAtPrice") || hasOwn(body, "compare_at_price")) {
    const value = firstDefined(body.originalPrice, body.compareAtPrice, body.compare_at_price);
    fields.compare_at_price = value === "" || value === null || value === undefined ? null : money(value, "Original price");
  }
  if (creating || hasOwn(body, "stock") || hasOwn(body, "stockQuantity")) {
    fields.stock_quantity = integer(firstDefined(body.stock, body.stockQuantity, 25), "Stock", 0, 4294967295);
  }
  if (creating || hasOwn(body, "lowStockThreshold") || hasOwn(body, "low_stock_threshold")) {
    fields.low_stock_threshold = integer(firstDefined(body.lowStockThreshold, body.low_stock_threshold, 10), "Low-stock threshold", 0, 4294967295);
  }
  if (creating || hasOwn(body, "rating") || hasOwn(body, "ratingAverage")) {
    const value = firstDefined(body.rating, body.ratingAverage, 0);
    const rating = money(value, "Rating");
    if (rating > 5) throw httpError(400, "Rating must be between 0 and 5");
    fields.rating_average = rating;
  }
  if (creating || hasOwn(body, "reviewCount") || hasOwn(body, "review_count")) {
    fields.review_count = integer(firstDefined(body.reviewCount, body.review_count, 0), "Review count", 0, 4294967295);
  }
  if (creating || hasOwn(body, "brand")) fields.brand = optionalText(body.brand, 100);
  if (creating || hasOwn(body, "badge")) fields.badge = optionalText(body.badge, 40);
  if (creating || hasOwn(body, "sku")) {
    const supplied = cleanText(body.sku, 64);
    if (supplied && !/^[A-Za-z0-9._-]+$/.test(supplied)) throw httpError(400, "SKU is invalid");
    fields.sku = supplied || null;
  }
  if (creating || hasOwn(body, "art") || hasOwn(body, "artKey")) fields.art_key = cleanText(firstDefined(body.art, body.artKey, "box"), 50) || "box";
  if (creating || hasOwn(body, "accent") || hasOwn(body, "accentColor")) {
    const accent = cleanText(firstDefined(body.accent, body.accentColor, "#2563EB"), 7);
    if (!validColor(accent)) throw httpError(400, "Accent colour must be a six-digit hex colour");
    fields.accent_color = accent;
  }
  if (creating || hasOwn(body, "features")) fields.features = jsonArray(body.features, "Features");
  if (creating || hasOwn(body, "specs") || hasOwn(body, "specifications")) fields.specifications = jsonObject(firstDefined(body.specs, body.specifications), "Specifications");
  if (creating || hasOwn(body, "tags")) fields.tags = jsonArray(body.tags, "Tags");
  if (creating || hasOwn(body, "shipping") || hasOwn(body, "shippingMessage")) {
    fields.shipping_message = cleanText(firstDefined(body.shipping, body.shippingMessage, "Ships in 2-4 business days. Free delivery on orders above INR 999."), 500);
  }
  if (creating || hasOwn(body, "featured") || hasOwn(body, "isFeatured")) fields.is_featured = booleanValue(firstDefined(body.featured, body.isFeatured)) ? 1 : 0;
  if (creating || hasOwn(body, "deal") || hasOwn(body, "isDeal")) fields.is_deal = booleanValue(firstDefined(body.deal, body.isDeal)) ? 1 : 0;
  if (creating || hasOwn(body, "status")) {
    const status = cleanText(body.status, 20).toLowerCase() || "active";
    if (!PRODUCT_STATUS.has(status)) throw httpError(400, "Product status is invalid");
    fields.status = status;
  }
  if (creating) {
    fields.features = fields.features || [];
    fields.specifications = fields.specifications || {};
    fields.tags = fields.tags || [];
    fields.shipping_message = fields.shipping_message || "Ships in 2-4 business days. Free delivery on orders above INR 999.";
    fields.is_featured = fields.is_featured || 0;
    fields.is_deal = fields.is_deal || 0;
  }
  return fields;
}

function categoryFields(body, creating = false) {
  const fields = {};
  if (creating || hasOwn(body, "name")) fields.name = requiredText(body.name, "Category name", 120);
  if (creating || hasOwn(body, "slug")) {
    const slug = slugify(firstDefined(body.slug, body.name));
    if (!slug) throw httpError(400, "Category slug is invalid");
    fields.slug = slug;
  }
  if (creating || hasOwn(body, "description")) fields.description = optionalText(body.description, 500);
  if (creating || hasOwn(body, "art") || hasOwn(body, "iconKey")) fields.icon_key = cleanText(firstDefined(body.art, body.iconKey, "box"), 50) || "box";
  if (creating || hasOwn(body, "accent") || hasOwn(body, "accentColor")) {
    const accent = cleanText(firstDefined(body.accent, body.accentColor, "#2563EB"), 7);
    if (!validColor(accent)) throw httpError(400, "Accent colour must be a six-digit hex colour");
    fields.accent_color = accent;
  }
  if (creating || hasOwn(body, "sortOrder") || hasOwn(body, "sort_order")) fields.sort_order = integer(firstDefined(body.sortOrder, body.sort_order, 0), "Sort order", 0, 4294967295);
  if (creating || hasOwn(body, "isActive") || hasOwn(body, "is_active")) fields.is_active = booleanValue(firstDefined(body.isActive, body.is_active, true)) ? 1 : 0;
  if (creating || hasOwn(body, "parentId") || hasOwn(body, "parent_id")) fields.parentInput = firstDefined(body.parentId, body.parent_id);
  return fields;
}

async function categoryIdForInput(executor, input, required = true) {
  if (input === null || input === undefined || input === "") {
    if (required) throw httpError(400, "Category is required");
    return null;
  }
  const row = await findCategoryRow(executor, input);
  if (!row) throw httpError(400, "Category not found");
  return Number(row.category_id);
}

function productInsertValues(fields, categoryId) {
  const sku = fields.sku || `NC-${categoryId}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  return [
    categoryId,
    sku,
    fields.slug,
    fields.name,
    fields.brand,
    fields.short_description,
    fields.description,
    fields.price,
    fields.compare_at_price,
    fields.stock_quantity,
    fields.low_stock_threshold,
    fields.rating_average,
    fields.review_count,
    fields.badge,
    fields.is_featured,
    fields.is_deal,
    fields.status,
    fields.art_key,
    fields.accent_color,
    jsonString(fields.features),
    jsonString(fields.specifications),
    jsonString(fields.tags),
    fields.shipping_message
  ];
}

function updateProductFromFields(executor, row, fields) {
  const updates = { ...fields };
  delete updates.categoryInput;
  delete updates.sku;
  const keys = Object.keys(updates);
  if (!keys.length) return Promise.resolve();
  const assignments = keys.map((key) => `${key} = ?`).join(", ");
  return run(executor, `UPDATE products SET ${assignments} WHERE id = ?`, [...Object.values(updates), row.product_id]);
}

function mapCustomer(row) {
  return {
    id: `cus-${row.id}`,
    databaseId: Number(row.id),
    name: row.full_name,
    email: row.email,
    phone: row.phone || "",
    orders: Number(row.order_count || 0),
    spent: money(row.spent || 0),
    joinedAt: isoDate(row.created_at),
    status: Number(row.order_count || 0) > 0 ? "Active" : "New"
  };
}

async function getMonthlySeries() {
  const year = new Date().getUTCFullYear();
  const orderRows = await query(
    `SELECT DATE_FORMAT(placed_at, '%Y-%m') AS month_key,
            COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'refunded') THEN total_amount ELSE 0 END), 0) AS revenue,
            COUNT(*) AS orders
     FROM orders
     WHERE YEAR(placed_at) = ?
     GROUP BY DATE_FORMAT(placed_at, '%Y-%m')`,
    [year]
  );
  const customerRows = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_key, COUNT(*) AS customers
     FROM users
     WHERE role = 'customer' AND YEAR(created_at) = ?
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')`,
    [year]
  );
  const orderMap = new Map(orderRows.map((row) => [row.month_key, row]));
  const customerMap = new Map(customerRows.map((row) => [row.month_key, row]));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthNames.map((month, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    const order = orderMap.get(key) || {};
    const customers = customerMap.get(key) || {};
    return {
      month,
      monthKey: key,
      revenue: money(order.revenue || 0),
      orders: Number(order.orders || 0),
      customers: Number(customers.customers || 0)
    };
  });
}

function percentageDelta(current, previous) {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

app.get(
  "/api/health",
  asyncRoute(async (req, res) => {
    try {
      await query("SELECT 1 AS ok");
      res.json({ ok: true, service: "NovaCart API", storage: "MySQL", database: "connected", time: new Date().toISOString() });
    } catch {
      res.status(503).json({ ok: false, service: "NovaCart API", storage: "MySQL", database: "unavailable", time: new Date().toISOString() });
    }
  })
);

app.post(
  "/api/auth/signup",
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const name = requiredText(body.name || body.fullName, "Name", 120);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, "Email is invalid");
    if (typeof body.password !== "string" || body.password.length < 6) throw httpError(400, "Password must be at least 6 characters");
    const phone = optionalText(body.phone, 25) || "";
    const location = optionalText(body.location, 120) || "India";
    let result;
    try {
      result = await query(
        `INSERT INTO users (full_name, email, password_hash, phone, location, role, is_active)
         VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
        [name, email, await hashPassword(body.password), phone, location]
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw httpError(409, "An account with this email already exists");
      throw error;
    }
    const user = await findUserById(result.insertId);
    res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
  })
);

app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const email = cleanText(body.email, 254).toLowerCase();
    const password = body.password;
    if (!email || typeof password !== "string") throw httpError(400, "Email and password are required");
    const rows = await query(
      `SELECT id, full_name, email, password_hash, phone, avatar_url, gender, bio, location, role, is_active, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    const user = rows[0];
    if (!user || !Number(user.is_active) || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    await query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP(6) WHERE id = ?", [user.id]);
    res.json({ token: signToken(user), user: sanitizeUser(user) });
  })
);

app.get("/api/auth/me", authRequired, asyncRoute(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
}));

app.patch(
  "/api/auth/me",
  authRequired,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const updates = [];
    const values = [];
    if (hasOwn(body, "name") || hasOwn(body, "fullName")) {
      updates.push("full_name = ?");
      values.push(requiredText(firstDefined(body.name, body.fullName), "Name", 120));
    }
    if (hasOwn(body, "phone")) {
      updates.push("phone = ?");
      values.push(optionalText(body.phone, 25));
    }
    if (hasOwn(body, "location")) {
      updates.push("location = ?");
      values.push(optionalText(body.location, 120));
    }
    if (hasOwn(body, "picture") || hasOwn(body, "avatarUrl")) {
      const picture = optionalText(firstDefined(body.picture, body.avatarUrl), 512);
      updates.push("avatar_url = ?");
      values.push(picture);
    }
    if (hasOwn(body, "gender")) {
      updates.push("gender = ?");
      values.push(optionalText(body.gender, 30));
    }
    if (hasOwn(body, "bio")) {
      updates.push("bio = ?");
      values.push(optionalText(body.bio, 500));
    }
    if (updates.length) {
      await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, [...values, req.user.id]);
    }
    const user = await findUserById(req.user.id);
    res.json({ user: sanitizeUser(user) });
  })
);

app.get(
  "/api/auth/me/orders",
  authRequired,
  asyncRoute(async (req, res) => {
    res.json({ orders: await loadOrderRows(pool, "o.user_id = ?", [req.user.id]) });
  })
);

app.get(
  "/api/categories",
  asyncRoute(async (req, res) => {
    const rows = await query(`${CATEGORY_SELECT} ORDER BY c.sort_order, c.name`);
    res.json(rows.map(mapCategory));
  })
);

app.get(
  "/api/products",
  optionalAuth,
  asyncRoute(async (req, res) => {
    const body = req.query || {};
    const where = ["p.status = 'active'"];
    const params = [];
    if (body.category) {
      const category = await findCategoryRow(pool, String(body.category));
      if (!category) return res.json({ products: [], total: 0 });
      where.push("p.category_id = ?");
      params.push(category.category_id);
    }
    if (body.deal === "true" || body.deal === "1") where.push("p.is_deal = 1");
    if (body.min !== undefined && body.min !== "") {
      where.push("p.price >= ?");
      params.push(money(body.min, "Minimum price"));
    }
    if (body.max !== undefined && body.max !== "") {
      where.push("p.price <= ?");
      params.push(money(body.max, "Maximum price"));
    }
    if (body.search) {
      const term = `%${cleanText(body.search, 120).toLowerCase()}%`;
      where.push("(LOWER(p.name) LIKE ? OR LOWER(p.short_description) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(CAST(p.tags AS CHAR)) LIKE ?)");
      params.push(term, term, term, term);
    }
    if (body.tag) {
      where.push("LOWER(CAST(p.tags AS CHAR)) LIKE ?");
      params.push(`%${cleanText(body.tag, 80).toLowerCase()}%`);
    }
    const sortSql = PRODUCT_SORT[String(body.sort || "featured")] || PRODUCT_SORT.featured;
    const rows = await query(`${PRODUCT_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${sortSql}`, params);
    const products = rows.map((row) => mapProduct(row));
    res.json({ products, total: products.length });
  })
);

app.get(
  "/api/products/:id",
  optionalAuth,
  asyncRoute(async (req, res) => {
    const product = await getProductResponse(pool, String(req.params.id), false);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const relatedRows = await query(
      `${PRODUCT_SELECT} WHERE p.status = 'active' AND p.category_id = ? AND p.id <> ? ORDER BY p.is_featured DESC, p.id ASC LIMIT 4`,
      [product.databaseId, product.databaseId]
    );
    res.json({ product, related: relatedRows.map((row) => mapProduct(row)) });
  })
);

app.get(
  "/api/deals",
  asyncRoute(async (req, res) => {
    const rows = await query(`${PRODUCT_SELECT} WHERE p.status = 'active' AND p.is_deal = 1 ORDER BY p.price ASC, p.id ASC`);
    res.json({ deals: rows.map((row) => mapProduct(row)), endsAt: dealsEnd() });
  })
);

app.get(
  "/api/products/:id/reviews",
  asyncRoute(async (req, res) => {
    const product = await findProductRow(pool, String(req.params.id), false);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const rows = await query(`${REVIEW_SELECT} WHERE r.product_id = ? AND r.status = 'published' ORDER BY r.created_at DESC, r.id DESC`, [product.product_id]);
    res.json({ reviews: rows.map(mapReviewSelect) });
  })
);

app.post(
  "/api/products/:id/reviews",
  optionalAuth,
  asyncRoute(async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required to post a review" });
    const product = await findProductRow(pool, String(req.params.id), false);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const body = req.body || {};
    const rating = integer(body.rating, "Rating", 1, 5);
    const comment = requiredText(body.comment, "Comment", 5000);
    const title = optionalText(body.title, 150);
    let result;
    try {
      result = await withTransaction(async (connection) => {
        const locked = await findProductRow(connection, product.product_id, false);
        if (!locked) throw httpError(404, "Product not found");
        const existing = await run(connection, "SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1", [req.user.id, locked.product_id]);
        if (existing.length) throw httpError(409, "You have already reviewed this product");
        const orderRows = await run(
          connection,
          `SELECT oi.order_id AS order_id
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE oi.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
           ORDER BY o.placed_at DESC LIMIT 1`,
          [req.user.id, locked.product_id]
        );
        const orderId = orderRows[0] ? orderRows[0].order_id : null;
        const location = cleanText(req.user.location, 100) || "India";
        const insert = await run(
          connection,
          `INSERT INTO reviews (user_id, product_id, order_id, rating, title, comment, status, verified_purchase, location)
           VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
          [req.user.id, locked.product_id, orderId, rating, title, comment, orderId ? 1 : 0, location]
        );
        const current = await run(connection, "SELECT rating_average, review_count FROM products WHERE id = ? FOR UPDATE", [locked.product_id]);
        const previousAverage = money(current[0].rating_average || 0);
        const previousCount = Number(current[0].review_count || 0);
        const nextCount = previousCount + 1;
        const nextAverage = Math.round(((previousAverage * previousCount + rating) / nextCount) * 100) / 100;
        await run(connection, "UPDATE products SET rating_average = ?, review_count = ? WHERE id = ?", [nextAverage, nextCount, locked.product_id]);
        return insert;
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw httpError(409, "You have already reviewed this product");
      throw error;
    }
    const review = await query(`${REVIEW_SELECT} WHERE r.id = ? LIMIT 1`, [result.insertId]);
    res.status(201).json({ review: mapReview(review[0]) });
  })
);

app.get(
  "/api/reviews",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const rows = await query(`${REVIEW_SELECT} ORDER BY r.created_at DESC, r.id DESC`);
    res.json({ reviews: rows.map(mapReviewSelect) });
  })
);

app.delete(
  "/api/reviews/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const result = await withTransaction(async (connection) => {
      const rows = await run(connection, "SELECT id, product_id, rating FROM reviews WHERE id = ? FOR UPDATE", [req.params.id]);
      if (!rows[0]) throw httpError(404, "Review not found");
      await run(connection, "DELETE FROM reviews WHERE id = ?", [req.params.id]);
      const aggregate = await run(connection, "SELECT rating_average, review_count FROM products WHERE id = ? FOR UPDATE", [rows[0].product_id]);
      const current = aggregate[0];
      if (current) {
        const count = Number(current.review_count || 0);
        const nextCount = Math.max(0, count - 1);
        const nextAverage = nextCount ? Math.max(0, Math.min(5, Math.round(((money(current.rating_average || 0) * count - Number(rows[0].rating)) / nextCount) * 100) / 100)) : 0;
        await run(connection, "UPDATE products SET rating_average = ?, review_count = ? WHERE id = ?", [nextAverage, nextCount, rows[0].product_id]);
      }
      return rows[0];
    });
    res.json({ deleted: String(result.id) });
  })
);

app.post(
  "/api/orders",
  optionalAuth,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    if (!body.customer || typeof body.customer !== "object" || !body.address || typeof body.address !== "object" || !Array.isArray(body.items) || !body.items.length) {
      throw httpError(400, "customer, address and items are required");
    }
    const customerName = requiredText(body.customer.name, "Customer name", 120);
    const customerEmail = requiredText(body.customer.email, "Customer email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw httpError(400, "Customer email is invalid");
    const customerPhone = requiredText(body.customer.phone, "Customer phone", 25);
    const customer = { name: customerName, email: customerEmail, phone: customerPhone };
    const shippingAddress = buildOrderAddress(body.address, customer);
    const requestedItems = new Map();
    const order = await withTransaction(async (connection) => {
      for (const item of body.items) {
        if (!item || item.productId === undefined || item.productId === null || item.productId === "") throw httpError(400, "Each order item needs a productId");
        const quantity = integer(item.qty, "Quantity", 1, 99);
        const productLookup = await run(connection, "SELECT id FROM products WHERE id = ? OR slug = ? LIMIT 1", [item.productId, item.productId]);
        if (!productLookup[0]) throw httpError(400, "Order contains an invalid product");
        const productId = Number(productLookup[0].id);
        const combined = (requestedItems.get(productId) || 0) + quantity;
        if (combined > 99) throw httpError(400, "Quantity for an item cannot exceed 99");
        requestedItems.set(productId, combined);
      }
      const productIds = [...requestedItems.keys()];
      const placeholders = productIds.map(() => "?").join(", ");
      const productRows = await run(
        connection,
        `SELECT id, name, sku, price, stock_quantity, status, art_key, accent_color
         FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
        productIds
      );
      const products = new Map(productRows.map((row) => [Number(row.id), row]));
      let subtotal = 0;
      const lineItems = [];
      for (const productId of productIds) {
        const product = products.get(productId);
        if (!product || product.status !== "active") throw httpError(400, "Order contains an unavailable product");
        const quantity = requestedItems.get(productId);
        if (Number(product.stock_quantity) < quantity) throw httpError(409, `Insufficient stock for ${product.name}`);
        const lineTotal = Math.round(money(product.price) * quantity * 100) / 100;
        subtotal = Math.round((subtotal + lineTotal) * 100) / 100;
        lineItems.push({ product, quantity, lineTotal });
      }
      const delivery = deliveryInfo(body.delivery);
      const freeShippingAbove = settingNumber("freeShippingAbove", 999);
      const shipping = subtotal >= freeShippingAbove ? 0 : delivery.fee;
      const discount = subtotal >= 10000 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
      const taxRate = Math.min(100, settingNumber("taxRate", 0));
      const tax = Math.round(subtotal * taxRate / 100 * 100) / 100;
      const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;
      const billingAddress = body.billingAddress ? buildOrderAddress(body.billingAddress, customer) : null;
      const notes = cleanText(body.notes, 500);
      let number = orderNumber();
      let inserted;
      for (let attempt = 0; attempt < 3 && !inserted; attempt += 1) {
        try {
          const [result] = await connection.execute(
            `INSERT INTO orders
             (order_number, user_id, cart_id, status, subtotal, discount_total, shipping_total, tax_total, total_amount, currency_code, shipping_address_id, shipping_address, billing_address, notes)
             VALUES (?, ?, NULL, 'pending', ?, ?, ?, ?, ?, 'INR', NULL, ?, ?, ?)`,
            [number, req.user ? req.user.id : null, subtotal, discount, shipping, tax, total, jsonString(shippingAddress), billingAddress ? jsonString(billingAddress) : null, notes || null]
          );
          inserted = result;
        } catch (error) {
          if (error.code !== "ER_DUP_ENTRY" || attempt === 2) throw error;
          number = orderNumber();
        }
      }
      for (const item of lineItems) {
        await run(
          connection,
          `INSERT INTO order_items
           (order_id, product_id, product_name, product_sku, unit_price, quantity, discount_amount, tax_amount, line_total)
           VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
          [inserted.insertId, item.product.id, item.product.name, item.product.sku, money(item.product.price), item.quantity, item.lineTotal]
        );
        const update = await run(connection, "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?", [item.quantity, item.product.id, item.quantity]);
        if (update.affectedRows !== 1) throw httpError(409, `Insufficient stock for ${item.product.name}`);
      }
      if (total > 0) {
        await run(
          connection,
          `INSERT INTO payments
           (provider, provider_payment_id, idempotency_key, transaction_type, payment_method, status, amount, currency_code)
           VALUES ('sandbox', NULL, ?, 'charge', ?, 'pending', ?, 'INR')`,
          [`order-${number}-charge`, paymentMethod(body.payment), total]
        );
      }
      return getOrderDetails(connection, number);
    });
    res.status(201).json({ order });
  })
);

app.get(
  "/api/orders",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    res.json({ orders: await loadOrderRows(pool) });
  })
);

app.patch(
  "/api/orders/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const requestedStatus = cleanText(body.status, 20).toLowerCase().replace(/[\s-]+/g, "_");
    if (!ORDER_STATUS.has(requestedStatus)) throw httpError(400, "Order status is invalid");
    const current = await getOrderDetails(pool, String(req.params.id));
    if (!current) return res.status(404).json({ error: "Order not found" });
    await query("UPDATE orders SET status = ? WHERE order_number = ? OR CAST(id AS CHAR) = ?", [requestedStatus, String(req.params.id), String(req.params.id)]);
    const order = await getOrderDetails(pool, String(req.params.id));
    res.json({ order });
  })
);

app.get(
  "/api/customers",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const rows = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
              COALESCE(o.order_count, 0) AS order_count,
              COALESCE(o.spent, 0) AS spent
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS order_count,
                COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'refunded') THEN total_amount ELSE 0 END), 0) AS spent
         FROM orders WHERE user_id IS NOT NULL GROUP BY user_id
       ) o ON o.user_id = u.id
       WHERE u.role = 'customer'
       ORDER BY u.created_at DESC, u.id DESC`
    );
    res.json({ customers: rows.map(mapCustomer) });
  })
);

app.get(
  "/api/analytics/sales",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    res.json({ series: await getMonthlySeries() });
  })
);

app.get(
  "/api/dashboard",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const [statsRows, productRows, categoryRows, recentOrders, monthly] = await Promise.all([
      query(
        `SELECT
           COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'refunded') THEN total_amount ELSE 0 END), 0) AS total_revenue,
           COUNT(*) AS total_orders,
           COUNT(DISTINCT CASE WHEN status NOT IN ('cancelled', 'refunded') AND user_id IS NOT NULL THEN user_id END) AS active_customers
         FROM orders`
      ),
      query(
        `SELECT p.id, p.name, p.price, p.rating_average, p.review_count, p.art_key, p.accent_color,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled', 'refunded') THEN oi.quantity ELSE 0 END), 0) AS sold_quantity,
                COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled', 'refunded') THEN oi.line_total ELSE 0 END), 0) AS revenue
         FROM products p
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id
         WHERE p.status = 'active'
         GROUP BY p.id, p.name, p.price, p.rating_average, p.review_count, p.art_key, p.accent_color
         ORDER BY revenue DESC, p.review_count DESC
         LIMIT 5`
      ),
      query(
        `SELECT c.name AS name, COUNT(p.id) AS value
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
         WHERE c.is_active = 1
         GROUP BY c.id, c.name
         ORDER BY c.sort_order, c.name`
      ),
      loadOrderRows(pool, "", [], 6),
      getMonthlySeries()
    ]);
    const stats = statsRows[0] || {};
    const totalRevenue = money(stats.total_revenue || 0);
    const totalOrders = Number(stats.total_orders || 0);
    const activeCustomers = Number(stats.active_customers || 0);
    const currentIndex = new Date().getUTCMonth();
    const previousIndex = currentIndex === 0 ? 11 : currentIndex - 1;
    const topProducts = productRows.map((row) => ({
      id: String(row.id),
      name: row.name,
      art: row.art_key || "box",
      accent: row.accent_color || "#2563EB",
      price: money(row.price),
      rating: money(row.rating_average || 0),
      reviewCount: Number(row.review_count || 0),
      revenue: money(row.revenue || 0)
    }));
    res.json({
      stats: {
        totalRevenue,
        totalOrders,
        customers: activeCustomers,
        activeCustomers,
        products: productRows.length ? Number(productRows[0].total_products || 0) : 0,
        avgOrder: totalOrders ? Math.round(totalRevenue / totalOrders) : 0
      },
      revenueSeries: monthly.map((entry) => ({ label: entry.month, value: entry.revenue })),
      ordersSeries: monthly.map((entry) => ({ label: entry.month, value: entry.orders })),
      trends: {
        revenue: percentageDelta(monthly[currentIndex].revenue, monthly[previousIndex].revenue),
        orders: percentageDelta(monthly[currentIndex].orders, monthly[previousIndex].orders),
        customers: percentageDelta(monthly[currentIndex].customers, monthly[previousIndex].customers),
        products: 0
      },
      topProducts,
      categoryBreakdown: categoryRows.map((row) => ({ name: row.name, value: Number(row.value || 0) })),
      recentOrders
    });
  })
);

app.get(
  "/api/settings",
  asyncRoute(async (req, res) => {
    res.json({ settings: { ...runtimeSettings } });
  })
);

app.patch(
  "/api/settings",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const allowed = new Set(["storeName", "supportEmail", "supportPhone", "currency", "freeShippingAbove", "expressFee", "dealsEndAt", "taxRate", "lowStockAlert", "maintenanceMode", "orderAlerts", "lowStockAlerts", "digest"]);
    const next = { ...runtimeSettings };
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.has(key)) continue;
      if (["maintenanceMode", "orderAlerts", "lowStockAlerts", "digest"].includes(key)) next[key] = booleanValue(value);
      else next[key] = cleanText(value, 200);
    }
    runtimeSettings = next;
    res.json({ settings: { ...runtimeSettings } });
  })
);

app.post(
  "/api/products",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const fields = productFields(body, null);
    const categoryId = await categoryIdForInput(pool, fields.categoryInput, true);
    delete fields.categoryInput;
    if (fields.compare_at_price !== null && fields.compare_at_price !== undefined && fields.compare_at_price < fields.price) throw httpError(400, "Original price must be at least the sale price");
    let result;
    try {
      const values = productInsertValues(fields, categoryId);
      result = await query(
        `INSERT INTO products
         (category_id, sku, slug, name, brand, short_description, description, price, compare_at_price, stock_quantity, low_stock_threshold, rating_average, review_count, badge, is_featured, is_deal, status, art_key, accent_color, features, specifications, tags, shipping_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw httpError(409, "A product with that slug or SKU already exists");
      throw error;
    }
    const product = await getProductResponse(pool, result.insertId, true);
    res.status(201).json({ product });
  })
);

app.put(
  "/api/products/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const current = await findProductRow(pool, String(req.params.id), true);
    if (!current) return res.status(404).json({ error: "Product not found" });
    const fields = productFields(req.body || {}, current);
    if (fields.categoryInput !== undefined) {
      fields.category_id = await categoryIdForInput(pool, fields.categoryInput, true);
    }
    delete fields.categoryInput;
    const price = fields.price === undefined ? money(current.price) : fields.price;
    const compareAt = fields.compare_at_price === undefined ? (current.compare_at_price === null ? null : money(current.compare_at_price)) : fields.compare_at_price;
    if (compareAt !== null && compareAt < price) throw httpError(400, "Original price must be at least the sale price");
    await updateProductFromFields(pool, current, fields);
    const product = await getProductResponse(pool, current.product_id, true);
    res.json({ product });
  })
);

app.delete(
  "/api/products/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const product = await findProductRow(pool, String(req.params.id), true);
    if (!product) return res.status(404).json({ error: "Product not found" });
    try {
      await query("DELETE FROM products WHERE id = ?", [product.product_id]);
    } catch (error) {
      if (["ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2"].includes(error.code)) throw httpError(409, "Product cannot be deleted while it is referenced by existing data");
      throw error;
    }
    res.json({ deleted: product.slug });
  })
);

app.post(
  "/api/categories",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const fields = categoryFields(req.body || {}, true);
    const parentId = await categoryIdForInput(pool, fields.parentInput, false);
    delete fields.parentInput;
    let result;
    try {
      result = await query(
        `INSERT INTO categories (parent_id, name, slug, description, icon_key, accent_color, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [parentId, fields.name, fields.slug, fields.description, fields.icon_key, fields.accent_color, fields.sort_order, fields.is_active]
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") throw httpError(409, "A category with that slug already exists");
      throw error;
    }
    const category = await findCategoryRow(pool, result.insertId);
    res.status(201).json({ category: mapCategory(category) });
  })
);

app.put(
  "/api/categories/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const current = await findCategoryRow(pool, String(req.params.id));
    if (!current) return res.status(404).json({ error: "Category not found" });
    const fields = categoryFields(req.body || {}, false);
    if (fields.parentInput !== undefined) {
      const parentId = await categoryIdForInput(pool, fields.parentInput, false);
      if (parentId === Number(current.category_id)) throw httpError(400, "A category cannot be its own parent");
      fields.parent_id = parentId;
    }
    delete fields.parentInput;
    const keys = Object.keys(fields);
    if (keys.length) {
      try {
        await query(`UPDATE categories SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`, [...Object.values(fields), current.category_id]);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") throw httpError(409, "A category with that slug already exists");
        throw error;
      }
    }
    const category = await findCategoryRow(pool, current.category_id);
    res.json({ category: mapCategory(category) });
  })
);

app.delete(
  "/api/categories/:id",
  authRequired,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const category = await findCategoryRow(pool, String(req.params.id));
    if (!category) return res.status(404).json({ error: "Category not found" });
    try {
      await query("DELETE FROM categories WHERE id = ?", [category.category_id]);
    } catch (error) {
      if (["ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2"].includes(error.code)) throw httpError(409, "Category cannot be deleted while products or child categories reference it");
      throw error;
    }
    res.json({ deleted: category.slug });
  })
);

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    if (!req.path.startsWith("/assets/")) return res.sendFile(path.join(clientDist, "index.html"));
    return next();
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  return res.status(418).send("NovaCart API — build the client with `npm run build` to serve the UI.");
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number(error.status) || 500;
  if (error.message === "Origin not allowed") {
    return res.status(403).json({ error: error.message });
  }
  if (status >= 500) console.error(`Request failed [${req.method} ${req.path}]: ${error.code || error.name || "Error"}`);
  return res.status(status).json({ error: status >= 500 ? "Server error" : error.message || "Request failed" });
});

async function start() {
  try {
    await connect();
    const [products, orders, users] = await Promise.all([
      query("SELECT COUNT(*) AS count FROM products"),
      query("SELECT COUNT(*) AS count FROM orders"),
      query("SELECT COUNT(*) AS count FROM users")
    ]);
    app.listen(PORT, () => {
      console.log(`NovaCart API running at http://localhost:${PORT}`);
      console.log(`MySQL · Products: ${products[0].count} · Orders: ${orders[0].count} · Users: ${users[0].count}`);
    });
  } catch (error) {
    console.error(`Failed to connect to MySQL: ${error.message}`);
    console.error("Check MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD and MYSQL_DATABASE.");
    process.exitCode = 1;
  }
}

process.once("SIGINT", async () => {
  await close();
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await close();
  process.exit(0);
});

if (require.main === module) start();

module.exports = app;
