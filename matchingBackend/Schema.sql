-- ============================================================
-- MARKET ACCESS
-- CURRENT DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS market_access_demo;

USE market_access_demo;


-- ============================================================
-- REMOVE OLD VIEWS FIRST
-- ============================================================

DROP VIEW IF EXISTS v_active_listings;
DROP VIEW IF EXISTS v_active_demands;


-- ============================================================
-- REMOVE OLD TABLES
-- Child tables first because of foreign keys
-- ============================================================

DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS transport_providers;
DROP TABLE IF EXISTS demands;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS buyers;
DROP TABLE IF EXISTS producers;
DROP TABLE IF EXISTS products;


-- ============================================================
-- 1. PRODUCTS
-- ============================================================

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    category VARCHAR(50) NOT NULL,

    unit VARCHAR(20) NOT NULL DEFAULT 'kg',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_product_name (name),

    INDEX idx_product_category (category)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 2. PRODUCERS / FARMERS
-- ============================================================

CREATE TABLE producers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    type ENUM(
        'individual',
        'cooperative',
        'company',
        'farm'
    ) NOT NULL DEFAULT 'farm',

    location VARCHAR(100) NOT NULL,

    contact_phone VARCHAR(30),

    contact_email VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_producer_location (location)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 3. BUYERS
-- Matches buyers.js / BuyerSetup.tsx
-- ============================================================

CREATE TABLE buyers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    type ENUM(
        'restaurant',
        'hotel',
        'school',
        'retailer',
        'shop',
        'wholesaler',
        'catering'
    ) NOT NULL,

    location VARCHAR(100) NOT NULL,

    region VARCHAR(100) NOT NULL,

    contact VARCHAR(150) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_buyer_location (location),

    INDEX idx_buyer_type (type)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 4. LISTINGS
-- What farmers currently have available
-- ============================================================

CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    producer_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    price_per_unit DECIMAL(10,2) NOT NULL,

    available_date DATE NOT NULL,

    image_data MEDIUMTEXT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_producer
        FOREIGN KEY (producer_id)
        REFERENCES producers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_listing_producer (producer_id),

    INDEX idx_listing_product (product_id),

    INDEX idx_listing_available (available_date),

    INDEX idx_listing_active (is_active)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 5. DEMANDS
-- Matches demands.js / BuyerNeed.tsx
-- ============================================================

CREATE TABLE demands (
    id INT AUTO_INCREMENT PRIMARY KEY,

    buyer_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity_needed DECIMAL(12,2) NOT NULL,

    budget_price DECIMAL(10,2) NOT NULL,

    frequency ENUM(
        'once',
        'weekly',
        'monthly'
    ) NOT NULL DEFAULT 'once',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_demand_buyer
        FOREIGN KEY (buyer_id)
        REFERENCES buyers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_demand_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_demand_buyer (buyer_id),

    INDEX idx_demand_product (product_id),

    INDEX idx_demand_active (is_active),

    INDEX idx_demand_frequency (frequency)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 6. TRANSPORT PROVIDERS
-- Matches current transport API naming
-- ============================================================

CREATE TABLE transport_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    coverage_area VARCHAR(255) NOT NULL,

    cost_per_km DECIMAL(10,2) NOT NULL,

    contact VARCHAR(150) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 7. MATCHES
-- ============================================================

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,

    listing_id INT NOT NULL,

    demand_id INT NOT NULL,

    score DECIMAL(5,1) NOT NULL,

    distance_km DECIMAL(10,2) NOT NULL,

    transport_cost DECIMAL(10,2) NOT NULL,

    price_difference DECIMAL(10,2) NOT NULL,

    status ENUM(
        'pending',
        'accepted',
        'rejected',
        'expired'
    ) NOT NULL DEFAULT 'pending',

    viewed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_match_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_match_demand
        FOREIGN KEY (demand_id)
        REFERENCES demands(id)
        ON DELETE CASCADE,

    INDEX idx_match_listing (listing_id),

    INDEX idx_match_demand (demand_id),

    INDEX idx_match_score (score),

    INDEX idx_match_status (status)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 8. PRODUCT SEED DATA
-- ============================================================

INSERT INTO products (
    name,
    category,
    unit
)
VALUES

('Tomatoes', 'Vegetable', 'kg'),
('Onions', 'Vegetable', 'kg'),
('Cabbage', 'Vegetable', 'kg'),
('Carrots', 'Vegetable', 'kg'),
('Lettuce', 'Vegetable', 'kg'),
('Spinach', 'Vegetable', 'kg'),
('Potatoes', 'Vegetable', 'kg'),

('Maize', 'Grain', 'kg'),
('Wheat', 'Grain', 'kg'),
('Sorghum', 'Grain', 'kg'),
('Millet', 'Grain', 'kg'),

('Oranges', 'Fruit', 'kg'),
('Apples', 'Fruit', 'kg'),
('Bananas', 'Fruit', 'kg'),
('Watermelon', 'Fruit', 'kg'),

('Beef', 'Meat', 'kg'),
('Chicken', 'Meat', 'kg'),

('Milk', 'Dairy', 'litres')

ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    unit = VALUES(unit);


-- ============================================================
-- 9. ACTIVE LISTINGS VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_active_listings AS

SELECT

    l.id AS listing_id,

    p.id AS producer_id,

    p.name AS producer_name,

    p.location AS producer_location,

    p.contact_phone AS producer_phone,

    p.contact_email AS producer_email,

    pr.id AS product_id,

    pr.name AS product_name,

    pr.category,

    pr.unit,

    l.quantity,

    l.price_per_unit,

    l.available_date,

    l.image_data,

    l.is_active

FROM listings l

JOIN producers p
    ON l.producer_id = p.id

JOIN products pr
    ON l.product_id = pr.id

WHERE l.is_active = TRUE

AND l.available_date <= CURDATE();


-- ============================================================
-- 10. ACTIVE DEMANDS VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_active_demands AS

SELECT

    d.id AS demand_id,

    b.id AS buyer_id,

    b.name AS buyer_name,

    b.location AS buyer_location,

    b.region AS buyer_region,

    b.contact AS buyer_contact,

    pr.id AS product_id,

    pr.name AS product_name,

    pr.category,

    pr.unit,

    d.quantity_needed,

    d.budget_price,

    d.frequency,

    d.is_active

FROM demands d

JOIN buyers b
    ON d.buyer_id = b.id

JOIN products pr
    ON d.product_id = pr.id

WHERE d.is_active = TRUE;


-- ============================================================
-- DONE
-- ============================================================