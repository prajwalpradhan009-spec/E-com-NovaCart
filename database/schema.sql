CREATE DATABASE IF NOT EXISTS novacart
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE novacart;

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';
SET SESSION sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  phone VARCHAR(25) DEFAULT NULL,
  avatar_url VARCHAR(512) DEFAULT NULL,
  gender VARCHAR(30) DEFAULT NULL,
  bio VARCHAR(500) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  is_active TINYINT UNSIGNED NOT NULL DEFAULT 1,
  email_verified_at TIMESTAMP(6) NULL DEFAULT NULL,
  last_login_at TIMESTAMP(6) NULL DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_active (role, is_active),
  KEY idx_users_created_at (created_at, id),
  CONSTRAINT chk_users_email_normalized CHECK (email = LOWER(TRIM(email)) AND CHAR_LENGTH(email) >= 3),
  CONSTRAINT chk_users_role CHECK (role IN ('customer', 'admin')),
  CONSTRAINT chk_users_active CHECK (is_active IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED DEFAULT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  icon_key VARCHAR(50) NOT NULL DEFAULT 'box',
  accent_color CHAR(7) NOT NULL DEFAULT '#2563EB',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent_sort (parent_id, sort_order, id),
  KEY idx_categories_active_sort (is_active, sort_order, name),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_categories_active CHECK (is_active IN (0, 1)),
  CONSTRAINT chk_categories_accent CHECK (accent_color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  address_type VARCHAR(20) NOT NULL DEFAULT 'shipping',
  recipient_name VARCHAR(120) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state_region VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country_code CHAR(2) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT 'IN',
  is_default TINYINT UNSIGNED NOT NULL DEFAULT 0,
  default_user_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_addresses_one_default (default_user_id),
  KEY idx_addresses_user_type (user_id, address_type, id),
  KEY idx_addresses_user_updated (user_id, updated_at, id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT chk_addresses_type CHECK (address_type IN ('shipping', 'billing', 'both')),
  CONSTRAINT chk_addresses_default CHECK (
    (is_default = 0 AND default_user_id IS NULL)
    OR (is_default = 1 AND default_user_id = user_id)
  ),
  CONSTRAINT chk_addresses_country CHECK (country_code = UPPER(country_code))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  sku VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(180) NOT NULL,
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100) DEFAULT NULL,
  short_description VARCHAR(500) NOT NULL,
  description MEDIUMTEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2) DEFAULT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 10,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  badge VARCHAR(40) DEFAULT NULL,
  is_featured TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_deal TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  art_key VARCHAR(50) NOT NULL DEFAULT 'box',
  accent_color CHAR(7) NOT NULL DEFAULT '#2563EB',
  features JSON NOT NULL,
  specifications JSON NOT NULL,
  tags JSON NOT NULL,
  shipping_message VARCHAR(500) NOT NULL DEFAULT 'Ships in 2-4 business days. Free delivery on orders above INR 999.',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category_browse (category_id, status, created_at, id),
  KEY idx_products_browse (status, is_featured, created_at, id),
  KEY idx_products_price (status, price, id),
  KEY idx_products_deal (status, is_deal, price, id),
  FULLTEXT KEY ft_products_search (name, short_description, description),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_compare_price CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  CONSTRAINT chk_products_rating CHECK (rating_average BETWEEN 0.00 AND 5.00),
  CONSTRAINT chk_products_featured CHECK (is_featured IN (0, 1)),
  CONSTRAINT chk_products_deal CHECK (is_deal IN (0, 1)),
  CONSTRAINT chk_products_status CHECK (status IN ('draft', 'active', 'archived')),
  CONSTRAINT chk_products_features_array CHECK (JSON_TYPE(features) = 'ARRAY'),
  CONSTRAINT chk_products_specifications_object CHECK (JSON_TYPE(specifications) = 'OBJECT'),
  CONSTRAINT chk_products_tags_array CHECK (JSON_TYPE(tags) = 'ARRAY'),
  CONSTRAINT chk_products_accent CHECK (accent_color REGEXP '^#[0-9A-Fa-f]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  width INT UNSIGNED DEFAULT NULL,
  height INT UNSIGNED DEFAULT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_primary TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_images_product_path (product_id, image_path),
  KEY idx_images_product_sort (product_id, sort_order, id),
  KEY idx_images_cover (is_primary, product_id),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT chk_images_primary CHECK (is_primary IN (0, 1)),
  CONSTRAINT chk_images_dimensions CHECK ((width IS NULL OR width > 0) AND (height IS NULL OR height > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  guest_token CHAR(36) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  active_user_id BIGINT UNSIGNED DEFAULT NULL,
  expires_at TIMESTAMP(6) DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_active_user (active_user_id),
  UNIQUE KEY uq_carts_guest_token (guest_token),
  KEY idx_carts_user_status (user_id, status, id),
  KEY idx_carts_expiry (expires_at),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT chk_carts_owner CHECK ((user_id IS NOT NULL AND guest_token IS NULL) OR (user_id IS NULL AND guest_token IS NOT NULL)),
  CONSTRAINT chk_carts_active_owner CHECK (
    (status = 'active' AND active_user_id <=> user_id)
    OR (status <> 'active' AND active_user_id IS NULL)
  ),
  CONSTRAINT chk_carts_guest_token CHECK (guest_token IS NULL OR CHAR_LENGTH(guest_token) = 36),
  CONSTRAINT chk_carts_status CHECK (status IN ('active', 'converted', 'abandoned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cart_items (
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (cart_id, product_id),
  KEY idx_cart_items_product (product_id, cart_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_cart_items_quantity CHECK (quantity BETWEEN 1 AND 99)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  cart_id BIGINT UNSIGNED DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  discount_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  shipping_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,
  currency_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'INR',
  shipping_address_id BIGINT UNSIGNED DEFAULT NULL,
  shipping_address JSON NOT NULL,
  billing_address JSON DEFAULT NULL,
  notes VARCHAR(500) DEFAULT NULL,
  placed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  UNIQUE KEY uq_orders_cart (cart_id),
  KEY idx_orders_user_placed (user_id, placed_at, id),
  KEY idx_orders_status_placed (status, placed_at, id),
  KEY idx_orders_shipping_address (shipping_address_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT fk_orders_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES user_addresses (id) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT chk_orders_status CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  CONSTRAINT chk_orders_totals CHECK (
    subtotal >= 0
    AND discount_total >= 0
    AND discount_total <= subtotal
    AND shipping_total >= 0
    AND tax_total >= 0
    AND total_amount = subtotal - discount_total + shipping_total + tax_total
  ),
  CONSTRAINT chk_orders_shipping_address_json CHECK (JSON_TYPE(shipping_address) = 'OBJECT'),
  CONSTRAINT chk_orders_billing_address_json CHECK (billing_address IS NULL OR JSON_TYPE(billing_address) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_sku VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_items_order_product (order_id, product_id),
  KEY idx_order_items_product (product_id, order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_amounts CHECK (
    unit_price >= 0
    AND discount_amount >= 0
    AND discount_amount <= unit_price * quantity
    AND tax_amount >= 0
    AND line_total = unit_price * quantity - discount_amount + tax_amount
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_payment_id VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  idempotency_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  transaction_type VARCHAR(20) NOT NULL DEFAULT 'charge',
  payment_method VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL,
  currency_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'INR',
  failure_code VARCHAR(64) DEFAULT NULL,
  failure_message VARCHAR(255) DEFAULT NULL,
  processed_at TIMESTAMP(6) DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_idempotency (idempotency_key),
  UNIQUE KEY uq_payments_provider_reference (provider, provider_payment_id),
  KEY idx_payments_order_created (order_id, created_at, id),
  KEY idx_payments_status_created (status, created_at, id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_payments_transaction_type CHECK (transaction_type IN ('charge', 'refund')),
  CONSTRAINT chk_payments_method CHECK (payment_method IN ('card', 'upi', 'net_banking', 'wallet', 'cash_on_delivery', 'other')),
  CONSTRAINT chk_payments_status CHECK (status IN ('pending', 'authorized', 'succeeded', 'failed', 'cancelled', 'partially_refunded', 'refunded')),
  CONSTRAINT chk_payments_amount CHECK ((transaction_type = 'charge' AND amount > 0) OR (transaction_type = 'refund' AND amount < 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED DEFAULT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(150) DEFAULT NULL,
  comment TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  verified_purchase TINYINT UNSIGNED NOT NULL DEFAULT 0,
  helpful_count INT UNSIGNED NOT NULL DEFAULT 0,
  location VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_user_product (user_id, product_id),
  KEY idx_reviews_product_status_created (product_id, status, created_at, id),
  KEY idx_reviews_user_created (user_id, created_at, id),
  KEY idx_reviews_order_product (order_id, product_id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_reviews_order_product FOREIGN KEY (order_id, product_id) REFERENCES order_items (order_id, product_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT chk_reviews_status CHECK (status IN ('pending', 'published', 'rejected')),
  CONSTRAINT chk_reviews_verified CHECK ((order_id IS NULL AND verified_purchase = 0) OR (order_id IS NOT NULL AND verified_purchase = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE wishlist (
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, product_id),
  KEY idx_wishlist_product (product_id, user_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coupons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  name VARCHAR(120) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  maximum_discount_amount DECIMAL(12,2) DEFAULT NULL,
  minimum_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin DEFAULT 'INR',
  usage_limit INT UNSIGNED DEFAULT NULL,
  per_user_limit INT UNSIGNED NOT NULL DEFAULT 1,
  starts_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  ends_at TIMESTAMP(6) DEFAULT NULL,
  is_active TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code),
  KEY idx_coupons_active_window (is_active, starts_at, ends_at),
  CONSTRAINT chk_coupons_code_uppercase CHECK (code = UPPER(code)),
  CONSTRAINT chk_coupons_discount CHECK (
    (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100)
    OR (discount_type = 'fixed_amount' AND discount_value > 0)
    OR (discount_type = 'free_shipping' AND discount_value = 0)
  ),
  CONSTRAINT chk_coupons_max_discount CHECK (maximum_discount_amount IS NULL OR maximum_discount_amount > 0),
  CONSTRAINT chk_coupons_minimum CHECK (minimum_order_amount >= 0),
  CONSTRAINT chk_coupons_limits CHECK ((usage_limit IS NULL OR usage_limit > 0) AND per_user_limit > 0),
  CONSTRAINT chk_coupons_window CHECK (ends_at IS NULL OR ends_at > starts_at),
  CONSTRAINT chk_coupons_active CHECK (is_active IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE coupon_usage (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  coupon_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupon_usage_order (order_id),
  KEY idx_coupon_usage_coupon_user (coupon_id, user_id, created_at),
  KEY idx_coupon_usage_user (user_id, created_at, id),
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_coupon_usage_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_coupon_usage_discount CHECK (discount_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  notification_type VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  data JSON DEFAULT NULL,
  is_read TINYINT UNSIGNED NOT NULL DEFAULT 0,
  read_at TIMESTAMP(6) DEFAULT NULL,
  expires_at TIMESTAMP(6) DEFAULT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_notifications_user_unread (user_id, is_read, created_at, id),
  KEY idx_notifications_user_created (user_id, created_at, id),
  KEY idx_notifications_expiry (expires_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT chk_notifications_type CHECK (notification_type IN ('order', 'payment', 'promotion', 'account', 'cart', 'review', 'system')),
  CONSTRAINT chk_notifications_data CHECK (data IS NULL OR JSON_TYPE(data) = 'OBJECT'),
  CONSTRAINT chk_notifications_read CHECK ((is_read = 0 AND read_at IS NULL) OR (is_read = 1 AND read_at IS NOT NULL)),
  CONSTRAINT chk_notifications_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
