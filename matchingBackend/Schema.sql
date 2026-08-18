-- ============================================================
-- NAMIBIA MARKET ACCESS NETWORK - Database Schema & Sample Data
-- For MySQL (version 5.7+ or 8.0+)
-- ============================================================

-- Step 1: Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS transport_providers;
DROP TABLE IF EXISTS demands;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS buyers;
DROP TABLE IF EXISTS producers;
DROP TABLE IF EXISTS products;

-- ============================================================
-- STEP 2: Create the tables
-- ============================================================

-- 2.1 PRODUCTS (master list of all products)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Vegetable', 'Fruit', 'Grain', 'Meat', 'Dairy'
    unit VARCHAR(20) DEFAULT 'kg', -- kg, litres, pieces, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    UNIQUE KEY uk_product_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.2 PRODUCERS (farmers, producers, suppliers)
CREATE TABLE producers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('individual', 'cooperative', 'company', 'farm') DEFAULT 'farm',
    location VARCHAR(100) NOT NULL, -- town/city in Namibia
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.3 LISTINGS (specific products a producer is selling)
CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL CHECK (quantity > 0), -- in unit (kg, etc.)
    price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0), -- N$/unit
    available_date DATE NOT NULL, -- when the product is ready
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product (product_id),
    INDEX idx_available (available_date),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.4 BUYERS (restaurants, hotels, schools, shops, wholesalers)
CREATE TABLE buyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('restaurant', 'hotel', 'school', 'shop', 'wholesaler', 'catering') NOT NULL,
    location VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_location (location),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.5 DEMANDS (what buyers need)
CREATE TABLE demands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL CHECK (quantity > 0),
    budget_per_unit DECIMAL(10,2) NOT NULL CHECK (budget_per_unit > 0), -- max N$/unit they'll pay
    recurring BOOLEAN DEFAULT FALSE, -- TRUE = weekly/monthly recurring order
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_product (product_id),
    INDEX idx_active (is_active),
    INDEX idx_recurring (recurring)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.6 TRANSPORT PROVIDERS (logistics companies)
CREATE TABLE transport_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    area_covered VARCHAR(255) NOT NULL, -- e.g., 'Windhoek to Otjiwarongo', 'Nationwide'
    cost_per_km DECIMAL(10,2) NOT NULL CHECK (cost_per_km > 0),
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_covered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.7 MATCHES (the output of Part C's matching engine)
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    demand_id INT NOT NULL,
    score DECIMAL(5,1) NOT NULL CHECK (score >= 0 AND score <= 100),
    distance_km DECIMAL(10,2) NOT NULL,
    transport_cost DECIMAL(10,2) NOT NULL,
    price_difference DECIMAL(10,2) NOT NULL, -- positive = seller price > buyer budget
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    viewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE,
    
    INDEX idx_listing (listing_id),
    INDEX idx_demand (demand_id),
    INDEX idx_score (score DESC),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STEP 3: Insert Sample Data
-- ============================================================

-- 3.1 Products (Namibian staples & commercial crops)
INSERT INTO products (name, category, unit) VALUES
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
('Grapes', 'Fruit', 'kg'),
('Beef', 'Meat', 'kg'),
('Chicken', 'Meat', 'kg'),
('Pork', 'Meat', 'kg'),
('Goat', 'Meat', 'kg'),
('Lamb', 'Meat', 'kg'),
('Milk', 'Dairy', 'litres'),
('Cheese', 'Dairy', 'kg'),
('Yogurt', 'Dairy', 'litres');

-- 3.2 Producers (farmers & agricultural businesses)
INSERT INTO producers (name, type, location, contact_phone, contact_email) VALUES
('Okatumba Farm', 'farm', 'Otjiwarongo', '+264 81 123 4567', 'info@okatumba.com'),
('Green Valley Produce', 'company', 'Windhoek', '+264 81 234 5678', 'orders@greenvalley.na'),
('Namib Fresh', 'cooperative', 'Mariental', '+264 81 345 6789', 'namibfresh@coop.na'),
('Oshakati Greens', 'cooperative', 'Oshakati', '+264 81 456 7890', 'greens@oshakati.org'),
('Rundu River Farms', 'farm', 'Rundu', '+264 81 567 8901', 'river@rundufarm.com'),
('Coastal Organics', 'company', 'Swakopmund', '+264 81 678 9012', 'organic@coastal.na'),
('Tsumeb Golden Produce', 'cooperative', 'Tsumeb', '+264 81 789 0123', 'golden@tsumeb.coop'),
('Gobabis Grain Co.', 'company', 'Gobabis', '+264 81 890 1234', 'grain@gobabis.com'),
('Keetmanshoop Meat Packers', 'company', 'Keetmanshoop', '+264 81 901 2345', 'meat@keetmanshoop.com'),
('Walvis Bay Fisheries', 'company', 'Walvis Bay', '+264 81 012 3456', 'fish@walvisbay.com');

-- 3.3 Listings (what producers are selling)
-- Using available_date: '2026-09-01' for September availability, '2026-10-01' for October, etc.
INSERT INTO listings (producer_id, product_id, quantity, price_per_unit, available_date) VALUES
-- Okatumba Farm (id=1)
(1, (SELECT id FROM products WHERE name='Tomatoes'), 1500, 8.00, '2026-09-01'),
(1, (SELECT id FROM products WHERE name='Onions'), 800, 6.50, '2026-09-15'),
-- Green Valley Produce (id=2)
(2, (SELECT id FROM products WHERE name='Tomatoes'), 800, 9.50, '2026-09-10'),
(2, (SELECT id FROM products WHERE name='Lettuce'), 400, 12.00, '2026-09-05'),
(2, (SELECT id FROM products WHERE name='Carrots'), 600, 7.00, '2026-09-01'),
-- Namib Fresh (id=3)
(3, (SELECT id FROM products WHERE name='Onions'), 2000, 6.00, '2026-10-01'),
(3, (SELECT id FROM products WHERE name='Potatoes'), 3000, 5.00, '2026-10-15'),
-- Oshakati Greens (id=4)
(4, (SELECT id FROM products WHERE name='Cabbage'), 1200, 5.50, '2026-09-01'),
(4, (SELECT id FROM products WHERE name='Spinach'), 500, 8.00, '2026-09-20'),
-- Rundu River Farms (id=5)
(5, (SELECT id FROM products WHERE name='Maize'), 5000, 4.00, '2026-09-01'),
(5, (SELECT id FROM products WHERE name='Sorghum'), 3000, 3.50, '2026-10-01'),
-- Coastal Organics (id=6)
(6, (SELECT id FROM products WHERE name='Lettuce'), 350, 13.50, '2026-09-15'),
(6, (SELECT id FROM products WHERE name='Tomatoes'), 500, 10.00, '2026-09-15'),
-- Tsumeb Golden Produce (id=7)
(7, (SELECT id FROM products WHERE name='Carrots'), 900, 7.00, '2026-09-10'),
(7, (SELECT id FROM products WHERE name='Onions'), 1100, 6.25, '2026-09-20'),
-- Gobabis Grain Co. (id=8)
(8, (SELECT id FROM products WHERE name='Wheat'), 8000, 3.50, '2026-11-01'),
(8, (SELECT id FROM products WHERE name='Millet'), 2000, 4.20, '2026-10-01'),
-- Keetmanshoop Meat Packers (id=9)
(9, (SELECT id FROM products WHERE name='Beef'), 1500, 45.00, '2026-09-01'),
(9, (SELECT id FROM products WHERE name='Lamb'), 800, 55.00, '2026-09-15');

-- 3.4 Buyers
INSERT INTO buyers (name, type, location, contact_phone, contact_email) VALUES
('Hilton Windhoek', 'hotel', 'Windhoek', '+264 61 123 456', 'procurement@hilton.na'),
('Namibia School Catering', 'catering', 'Windhoek', '+264 61 234 567', 'catering@schools.na'),
('The Olive Restaurant', 'restaurant', 'Windhoek', '+264 61 345 678', 'chef@olive.na'),
('Swakopmund Hotel', 'hotel', 'Swakopmund', '+264 64 456 789', 'buy@swakopmundhotel.com'),
('Oshakati Fresh Market', 'shop', 'Oshakati', '+264 65 567 890', 'fresh@oshakati.com'),
('Rundu Wholesale', 'wholesaler', 'Rundu', '+264 66 678 901', 'wholesale@rundu.co.na'),
('Gobabis Supermarket', 'shop', 'Gobabis', '+264 62 789 012', 'buy@gobabissupermarket.com'),
('Tsumeb Guesthouse', 'hotel', 'Tsumeb', '+264 67 890 123', 'guest@tsumeb.com'),
('Keetmanshoop School', 'school', 'Keetmanshoop', '+264 63 901 234', 'admin@keetschool.na'),
('Walvis Bay Seafood Grill', 'restaurant', 'Walvis Bay', '+264 64 012 345', 'grill@walvisbay.com'),
('Windhoek Central Market', 'shop', 'Windhoek', '+264 61 123 789', 'central@windhoekmarket.com'),
('Namibia University Catering', 'catering', 'Windhoek', '+264 61 234 890', 'food@unam.na');

-- 3.5 Demands (what buyers need)
INSERT INTO demands (buyer_id, product_id, quantity, budget_per_unit, recurring) VALUES
-- Hilton Windhoek (id=1)
(1, (SELECT id FROM products WHERE name='Tomatoes'), 300, 10.00, TRUE),
(1, (SELECT id FROM products WHERE name='Lettuce'), 150, 14.00, TRUE),
-- Namibia School Catering (id=2)
(2, (SELECT id FROM products WHERE name='Tomatoes'), 500, 8.50, FALSE),
(2, (SELECT id FROM products WHERE name='Cabbage'), 400, 6.00, FALSE),
-- The Olive Restaurant (id=3)
(3, (SELECT id FROM products WHERE name='Onions'), 200, 7.00, TRUE),
(3, (SELECT id FROM products WHERE name='Carrots'), 100, 8.00, TRUE),
-- Swakopmund Hotel (id=4)
(4, (SELECT id FROM products WHERE name='Lettuce'), 120, 15.00, TRUE),
(4, (SELECT id FROM products WHERE name='Tomatoes'), 200, 11.00, TRUE),
-- Oshakati Fresh Market (id=5)
(5, (SELECT id FROM products WHERE name='Cabbage'), 600, 6.00, FALSE),
(5, (SELECT id FROM products WHERE name='Spinach'), 300, 8.50, FALSE),
-- Rundu Wholesale (id=6)
(6, (SELECT id FROM products WHERE name='Maize'), 2000, 4.50, TRUE),
(6, (SELECT id FROM products WHERE name='Sorghum'), 1500, 4.00, TRUE),
-- Gobabis Supermarket (id=7)
(7, (SELECT id FROM products WHERE name='Wheat'), 1500, 4.00, TRUE),
(7, (SELECT id FROM products WHERE name='Millet'), 800, 4.50, TRUE),
-- Tsumeb Guesthouse (id=8)
(8, (SELECT id FROM products WHERE name='Carrots'), 100, 8.00, FALSE),
(8, (SELECT id FROM products WHERE name='Onions'), 80, 7.50, FALSE),
-- Keetmanshoop School (id=9)
(9, (SELECT id FROM products WHERE name='Beef'), 200, 50.00, FALSE),
(9, (SELECT id FROM products WHERE name='Lamb'), 100, 60.00, FALSE),
-- Walvis Bay Seafood Grill (id=10)
(10, (SELECT id FROM products WHERE name='Lettuce'), 80, 14.00, TRUE),
-- Windhoek Central Market (id=11)
(11, (SELECT id FROM products WHERE name='Tomatoes'), 400, 9.00, FALSE),
(11, (SELECT id FROM products WHERE name='Onions'), 300, 6.50, FALSE),
-- Namibia University Catering (id=12)
(12, (SELECT id FROM products WHERE name='Potatoes'), 600, 5.50, TRUE);

-- 3.6 Transport Providers
INSERT INTO transport_providers (name, area_covered, cost_per_km, contact_phone, contact_email) VALUES
('NamLogistics', 'Windhoek to Otjiwarongo, Gobabis, Mariental', 2.50, '+264 81 111 1111', 'info@namlogistics.na'),
('Desert Freight', 'Nationwide - all major towns', 3.00, '+264 81 222 2222', 'freight@desert.com'),
('Coastal Haulage', 'Windhoek, Swakopmund, Walvis Bay', 2.80, '+264 81 333 3333', 'coastal@haulage.na'),
('North Bound Transport', 'Windhoek to Oshakati, Rundu, Tsumeb', 3.20, '+264 81 444 4444', 'north@transport.na'),
('South Express', 'Windhoek to Keetmanshoop, Mariental', 2.90, '+264 81 555 5555', 'south@express.com');

-- ============================================================
-- STEP 4: Insert Sample Matches (demonstrating Part C output)
-- ============================================================

-- We'll insert a few realistic matches that the matching engine would produce
-- using the same scoring logic from the frontend code.

-- Match 1: Okatumba Farm Tomatoes (listing_id=1) -> Hilton Windhoek Tomatoes (demand_id=1)
-- Distance: Otjiwarongo to Windhoek ~ 250km, Score: 82.5
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(1, 1, 82.5, 248.7, 186.53, -2.00, 'pending');

-- Match 2: Green Valley Tomatoes (listing_id=3) -> Hilton Windhoek Tomatoes (demand_id=1)
-- Distance: Windhoek to Windhoek ~ 0km, Score: 92.0 (best match)
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(3, 1, 92.0, 5.2, 15.60, -0.50, 'pending');

-- Match 3: Okatumba Tomatoes (listing_id=1) -> Namibia School Catering Tomatoes (demand_id=3)
-- Distance: 248.7km, Score: 75.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(1, 3, 75.0, 248.7, 310.88, -0.50, 'pending');

-- Match 4: Namib Fresh Onions (listing_id=5) -> Olive Restaurant Onions (demand_id=5)
-- Distance: Mariental to Windhoek ~ 230km, Score: 78.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(5, 5, 78.0, 232.1, 139.26, -1.00, 'pending');

-- Match 5: Oshakati Greens Cabbage (listing_id=8) -> Oshakati Fresh Market Cabbage (demand_id=9)
-- Distance: within Oshakati ~ 3km, Score: 88.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(8, 9, 88.0, 3.4, 10.20, -0.50, 'pending');

-- Match 6: Rundu River Farms Maize (listing_id=10) -> Rundu Wholesale Maize (demand_id=11)
-- Distance: within Rundu ~ 5km, Score: 89.5
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(10, 11, 89.5, 4.8, 24.00, -0.50, 'pending');

-- Match 7: Gobabis Grain Co. Wheat (listing_id=15) -> Gobabis Supermarket Wheat (demand_id=13)
-- Distance: within Gobabis ~ 2km, Score: 91.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(15, 13, 91.0, 2.1, 7.35, -0.50, 'pending');

-- Match 8: Keetmanshoop Meat Packers Beef (listing_id=17) -> Keetmanshoop School Beef (demand_id=16)
-- Distance: within Keetmanshoop ~ 4km, Score: 85.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(17, 16, 85.0, 4.2, 18.90, -5.00, 'pending');

-- Match 9: Coastal Organics Lettuce (listing_id=12) -> Swakopmund Hotel Lettuce (demand_id=7)
-- Distance: Swakopmund to Swakopmund ~ 3km, Score: 90.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(12, 7, 90.0, 3.1, 10.85, -1.50, 'pending');

-- Match 10: Tsumeb Golden Carrots (listing_id=14) -> Tsumeb Guesthouse Carrots (demand_id=15)
-- Distance: within Tsumeb ~ 2km, Score: 87.0
INSERT INTO matches (listing_id, demand_id, score, distance_km, transport_cost, price_difference, status) VALUES
(14, 15, 87.0, 2.0, 7.00, -1.00, 'pending');

-- ============================================================
-- STEP 5: Verification Queries (run to test your data)
-- ============================================================

-- Count total records
SELECT 'Producers' AS TableName, COUNT(*) AS Count FROM producers
UNION SELECT 'Products', COUNT(*) FROM products
UNION SELECT 'Listings', COUNT(*) FROM listings
UNION SELECT 'Buyers', COUNT(*) FROM buyers
UNION SELECT 'Demands', COUNT(*) FROM demands
UNION SELECT 'Transport Providers', COUNT(*) FROM transport_providers
UNION SELECT 'Matches', COUNT(*) FROM matches;

-- View top matches with full details (for demonstration)
SELECT 
    m.id AS match_id,
    p.name AS producer,
    prod.name AS product,
    l.quantity AS available_qty,
    l.price_per_unit AS seller_price,
    b.name AS buyer,
    d.quantity AS demanded_qty,
    d.budget_per_unit AS buyer_budget,
    m.score,
    m.distance_km,
    m.transport_cost,
    m.price_difference,
    m.status
FROM matches m
JOIN listings l ON m.listing_id = l.id
JOIN producers p ON l.producer_id = p.id
JOIN products prod ON l.product_id = prod.id
JOIN demands d ON m.demand_id = d.id
JOIN buyers b ON d.buyer_id = b.id
ORDER BY m.score DESC;

-- Show which buyers are looking for tomatoes and matching listings
SELECT 
    b.name AS buyer,
    b.location AS buyer_location,
    d.quantity AS needed_kg,
    d.budget_per_unit AS budget,
    p.name AS producer,
    p.location AS producer_location,
    l.quantity AS available_kg,
    l.price_per_unit AS asking_price,
    (l.price_per_unit - d.budget_per_unit) AS price_gap
FROM demands d
JOIN buyers b ON d.buyer_id = b.id
JOIN products prod ON d.product_id = prod.id
LEFT JOIN listings l ON l.product_id = prod.id AND l.is_active = TRUE
LEFT JOIN producers p ON l.producer_id = p.id
WHERE prod.name = 'Tomatoes'
ORDER BY b.name, p.name;

-- ============================================================
-- STEP 6: Useful Views for the Matching Engine
-- ============================================================

-- View: active_listings_with_producer
CREATE OR REPLACE VIEW v_active_listings AS
SELECT 
    l.id AS listing_id,
    p.id AS producer_id,
    p.name AS producer_name,
    p.location AS producer_location,
    pr.id AS product_id,
    pr.name AS product_name,
    pr.category,
    l.quantity,
    l.price_per_unit,
    l.available_date,
    l.is_active
FROM listings l
JOIN producers p ON l.producer_id = p.id
JOIN products pr ON l.product_id = pr.id
WHERE l.is_active = TRUE
  AND l.available_date >= CURDATE();

-- View: active_demands_with_buyer
CREATE OR REPLACE VIEW v_active_demands AS
SELECT 
    d.id AS demand_id,
    b.id AS buyer_id,
    b.name AS buyer_name,
    b.location AS buyer_location,
    pr.id AS product_id,
    pr.name AS product_name,
    d.quantity,
    d.budget_per_unit,
    d.recurring,
    d.is_active
FROM demands d
JOIN buyers b ON d.buyer_id = b.id
JOIN products pr ON d.product_id = pr.id
WHERE d.is_active = TRUE;

-- ============================================================
-- DONE! Database is ready for Part C (Matching)
-- ============================================================