-- sample_data_inserts.sql — Phase 8 Extras
-- Sample data for the schema_ecommerce.sql schema.
-- Run schema_ecommerce.sql FIRST, then this file.
--
-- Contains: 20 customers, 15 products, 50 orders, 100 order items, 30 page events
-- All data is synthetic and suitable for classroom exercises.

-- ============================================================
-- CUSTOMERS (20 rows)
-- ============================================================

INSERT INTO customers (customer_id, email, first_name, last_name, country_code, segment, created_at, updated_at) VALUES
(1,  'priya.sharma@example.com',     'Priya',    'Sharma',     'IN', 'enterprise', '2023-03-15 08:00:00+05:30', '2024-11-02 10:30:00+05:30'),
(2,  'john.doe@example.com',         'John',     'Doe',        'US', 'consumer',   '2023-06-20 14:00:00-04:00', '2025-01-10 09:15:00-04:00'),
(3,  'akiko.tanaka@example.com',     'Akiko',    'Tanaka',     'JP', 'smb',        '2023-01-10 09:30:00+09:00', '2024-08-22 11:45:00+09:00'),
(4,  'hans.mueller@example.com',     'Hans',     'Müller',     'DE', 'enterprise', '2022-11-05 16:00:00+01:00', '2025-01-20 14:00:00+01:00'),
(5,  'maria.garcia@example.com',     'Maria',    'García',     'ES', 'consumer',   '2024-02-14 10:00:00+01:00', '2024-12-30 17:20:00+01:00'),
(6,  'chen.wei@example.com',         'Wei',      'Chen',       'CN', 'smb',        '2023-07-01 08:00:00+08:00', '2024-10-15 09:00:00+08:00'),
(7,  'oliver.smith@example.com',     'Oliver',   'Smith',      'GB', 'consumer',   '2024-01-22 12:30:00+00:00', '2025-01-05 15:10:00+00:00'),
(8,  'fatima.ali@example.com',       'Fatima',   'Ali',        'AE', 'enterprise', '2023-09-18 11:00:00+04:00', '2024-11-28 13:30:00+04:00'),
(9,  'liam.oconnor@example.com',     'Liam',     'O''Connor',  'IE', 'consumer',   '2024-04-03 09:00:00+01:00', '2024-12-12 10:45:00+01:00'),
(10, 'ananya.patel@example.com',     'Ananya',   'Patel',      'IN', 'smb',        '2023-05-25 07:30:00+05:30', '2025-01-18 08:00:00+05:30'),
(11, 'carlos.rivera@example.com',    'Carlos',   'Rivera',     'MX', 'consumer',   '2024-06-10 13:00:00-06:00', '2024-12-20 14:30:00-06:00'),
(12, 'sarah.johnson@example.com',    'Sarah',    'Johnson',    'US', 'enterprise', '2022-08-30 10:00:00-04:00', '2025-01-25 11:00:00-04:00'),
(13, 'yuki.sato@example.com',        'Yuki',     'Sato',       'JP', 'consumer',   '2024-03-07 15:00:00+09:00', '2024-11-10 16:30:00+09:00'),
(14, 'emma.larsson@example.com',     'Emma',     'Larsson',    'SE', 'smb',        '2023-12-01 08:00:00+01:00', '2025-01-15 09:20:00+01:00'),
(15, 'ravi.kumar@example.com',       'Ravi',     'Kumar',      'IN', 'consumer',   '2024-07-19 06:30:00+05:30', '2025-01-22 07:45:00+05:30'),
(16, 'sofia.rossi@example.com',      'Sofia',    'Rossi',      'IT', 'enterprise', '2023-02-28 09:00:00+01:00', '2024-09-14 10:10:00+01:00'),
(17, 'james.wang@example.com',       'James',    'Wang',       'AU', 'consumer',   '2024-08-05 11:00:00+10:00', '2025-01-08 12:00:00+10:00'),
(18, 'nina.ivanova@example.com',     'Nina',     'Ivanova',    'RU', 'smb',        '2023-10-12 14:00:00+03:00', '2024-12-05 15:15:00+03:00'),
(19, 'david.kim@example.com',        'David',    'Kim',        'KR', 'consumer',   '2024-05-20 16:30:00+09:00', '2025-01-02 17:00:00+09:00'),
(20, 'amara.okafor@example.com',     'Amara',    'Okafor',     'NG', 'smb',        '2024-09-01 08:00:00+01:00', '2025-01-19 09:30:00+01:00');


-- ============================================================
-- PRODUCTS (15 rows)
-- ============================================================

INSERT INTO products (product_id, sku, product_name, category, subcategory, base_price, cost_price, inventory_qty, is_active, created_at) VALUES
(1,  'ELEC-LP-001', 'ProBook 15 Laptop',         'Electronics', 'Laptops',      1299.99,  820.00,  45,  TRUE,  '2023-01-15 00:00:00+00:00'),
(2,  'ELEC-PH-002', 'SmartX Phone 14',            'Electronics', 'Phones',        899.99,  540.00,  120, TRUE,  '2023-02-20 00:00:00+00:00'),
(3,  'ELEC-HP-003', 'SoundMax Headphones BT',     'Electronics', 'Audio',         149.99,   62.00,  200, TRUE,  '2023-03-10 00:00:00+00:00'),
(4,  'FURN-DS-004', 'ErgoDesk Standing Desk',     'Furniture',   'Desks',         549.99,  280.00,  30,  TRUE,  '2023-04-05 00:00:00+00:00'),
(5,  'FURN-CH-005', 'ComfortPro Office Chair',    'Furniture',   'Chairs',        399.99,  190.00,  55,  TRUE,  '2023-04-05 00:00:00+00:00'),
(6,  'CLTH-TS-006', 'Classic Polo T-Shirt',       'Clothing',    'Tops',           39.99,   12.00,  500, TRUE,  '2023-05-01 00:00:00+00:00'),
(7,  'CLTH-JK-007', 'Urban Bomber Jacket',        'Clothing',    'Outerwear',     129.99,   55.00,  80,  TRUE,  '2023-05-15 00:00:00+00:00'),
(8,  'BOOK-DS-008', 'Data Science Handbook',      'Books',       'Technical',      49.99,   18.00,  300, TRUE,  '2023-06-01 00:00:00+00:00'),
(9,  'BOOK-MB-009', 'MBA Strategy Essentials',    'Books',       'Business',       59.99,   22.00,  250, TRUE,  '2023-06-01 00:00:00+00:00'),
(10, 'SPRT-YG-010', 'ProFlex Yoga Mat',           'Sports',      'Fitness',        34.99,   10.00,  400, TRUE,  '2023-07-10 00:00:00+00:00'),
(11, 'ELEC-MN-011', 'UltraView 27" 4K Monitor',  'Electronics', 'Monitors',      449.99,  260.00,  65,  TRUE,  '2023-08-01 00:00:00+00:00'),
(12, 'ELEC-KB-012', 'MechType Keyboard',          'Electronics', 'Peripherals',    89.99,   35.00,  180, TRUE,  '2023-08-15 00:00:00+00:00'),
(13, 'HOME-CF-013', 'AromaBrew Coffee Maker',     'Home',        'Kitchen',        79.99,   32.00,  90,  TRUE,  '2023-09-01 00:00:00+00:00'),
(14, 'SPRT-DB-014', 'HexGrip Dumbbells 10kg',     'Sports',      'Weights',        44.99,   18.00,  150, TRUE,  '2023-09-20 00:00:00+00:00'),
(15, 'ELEC-TB-015', 'TabX Pro 11 Tablet',         'Electronics', 'Tablets',       699.99,  410.00,  70,  FALSE, '2023-10-01 00:00:00+00:00');


-- ============================================================
-- ORDERS (50 rows)
-- ============================================================

INSERT INTO orders (order_id, customer_id, order_date, status, total_amount, discount_code, created_at) VALUES
(1,   1,  '2025-01-05', 'delivered',  1349.98, NULL,         '2025-01-05 09:12:00+05:30'),
(2,   2,  '2025-01-06', 'delivered',   899.99, 'NEWYEAR25',  '2025-01-06 14:30:00-04:00'),
(3,   3,  '2025-01-07', 'delivered',   239.97, NULL,         '2025-01-07 10:00:00+09:00'),
(4,   4,  '2025-01-08', 'delivered',   549.99, NULL,         '2025-01-08 16:45:00+01:00'),
(5,   5,  '2025-01-09', 'shipped',     169.97, NULL,         '2025-01-09 11:20:00+01:00'),
(6,   1,  '2025-01-10', 'delivered',   449.99, 'VIP10',      '2025-01-10 08:00:00+05:30'),
(7,   6,  '2025-01-11', 'delivered',    89.98, NULL,         '2025-01-11 09:30:00+08:00'),
(8,   7,  '2025-01-12', 'delivered',  1299.99, NULL,         '2025-01-12 13:15:00+00:00'),
(9,   8,  '2025-01-13', 'delivered',   659.97, 'BULK15',     '2025-01-13 11:00:00+04:00'),
(10,  9,  '2025-01-14', 'cancelled',   39.99,  NULL,         '2025-01-14 10:00:00+01:00'),
(11, 10,  '2025-01-15', 'delivered',   149.99, NULL,         '2025-01-15 07:45:00+05:30'),
(12, 11,  '2025-01-16', 'shipped',     529.98, NULL,         '2025-01-16 14:00:00-06:00'),
(13, 12,  '2025-01-17', 'delivered',  2599.98, 'CORP20',     '2025-01-17 10:30:00-04:00'),
(14, 13,  '2025-01-18', 'delivered',    49.99, NULL,         '2025-01-18 15:20:00+09:00'),
(15, 14,  '2025-01-19', 'processing',  399.99, NULL,         '2025-01-19 08:10:00+01:00'),
(16,  2,  '2025-01-20', 'delivered',   179.98, NULL,         '2025-01-20 12:00:00-04:00'),
(17, 15,  '2025-01-21', 'delivered',    74.98, NULL,         '2025-01-21 06:30:00+05:30'),
(18, 16,  '2025-01-22', 'delivered',   949.98, 'VIP10',      '2025-01-22 09:00:00+01:00'),
(19, 17,  '2025-01-23', 'shipped',     299.98, NULL,         '2025-01-23 11:30:00+10:00'),
(20, 18,  '2025-01-24', 'delivered',    89.99, NULL,         '2025-01-24 14:00:00+03:00'),
(21, 19,  '2025-01-25', 'delivered',   699.99, NULL,         '2025-01-25 16:30:00+09:00'),
(22, 20,  '2025-01-26', 'refunded',   129.99, NULL,         '2025-01-26 08:00:00+01:00'),
(23,  1,  '2025-01-27', 'delivered',    59.99, NULL,         '2025-01-27 09:45:00+05:30'),
(24,  3,  '2025-01-28', 'delivered',   539.98, NULL,         '2025-01-28 10:15:00+09:00'),
(25,  5,  '2025-01-29', 'delivered',    34.99, NULL,         '2025-01-29 11:00:00+01:00'),
(26,  7,  '2025-01-30', 'delivered',   449.99, 'WINTER10',   '2025-01-30 13:00:00+00:00'),
(27,  8,  '2025-01-31', 'pending',    1299.99, NULL,         '2025-01-31 11:20:00+04:00'),
(28, 12,  '2025-02-01', 'delivered',   179.98, NULL,         '2025-02-01 10:00:00-04:00'),
(29,  4,  '2025-02-02', 'delivered',   399.99, NULL,         '2025-02-02 16:00:00+01:00'),
(30,  6,  '2025-02-03', 'delivered',   149.99, NULL,         '2025-02-03 09:30:00+08:00'),
(31, 10,  '2025-02-04', 'shipped',     109.98, NULL,         '2025-02-04 07:00:00+05:30'),
(32, 15,  '2025-02-05', 'delivered',    49.99, NULL,         '2025-02-05 06:45:00+05:30'),
(33,  2,  '2025-02-06', 'delivered',  1749.98, 'LOYALVIP',   '2025-02-06 14:10:00-04:00'),
(34, 11,  '2025-02-07', 'delivered',    79.99, NULL,         '2025-02-07 13:30:00-06:00'),
(35, 16,  '2025-02-08', 'delivered',   549.99, NULL,         '2025-02-08 09:15:00+01:00'),
(36, 19,  '2025-02-09', 'processing',  899.99, NULL,         '2025-02-09 16:00:00+09:00'),
(37, 20,  '2025-02-10', 'delivered',    44.99, NULL,         '2025-02-10 08:30:00+01:00'),
(38,  9,  '2025-02-11', 'delivered',   259.98, NULL,         '2025-02-11 10:00:00+01:00'),
(39, 13,  '2025-02-12', 'delivered',   129.99, NULL,         '2025-02-12 15:00:00+09:00'),
(40, 14,  '2025-02-13', 'delivered',    89.99, NULL,         '2025-02-13 08:20:00+01:00'),
(41,  1,  '2025-02-14', 'delivered',   159.98, 'VDAY15',     '2025-02-14 09:00:00+05:30'),
(42,  4,  '2025-02-15', 'shipped',     449.99, NULL,         '2025-02-15 16:30:00+01:00'),
(43, 17,  '2025-02-16', 'delivered',    34.99, NULL,         '2025-02-16 11:45:00+10:00'),
(44, 18,  '2025-02-17', 'delivered',    59.99, NULL,         '2025-02-17 14:20:00+03:00'),
(45,  3,  '2025-02-18', 'delivered',   899.99, NULL,         '2025-02-18 10:30:00+09:00'),
(46,  5,  '2025-02-19', 'cancelled',  1299.99, NULL,         '2025-02-19 11:00:00+01:00'),
(47, 12,  '2025-02-20', 'delivered',   339.98, NULL,         '2025-02-20 10:15:00-04:00'),
(48,  6,  '2025-02-21', 'delivered',    89.99, NULL,         '2025-02-21 09:00:00+08:00'),
(49,  9,  '2025-02-22', 'pending',     549.99, NULL,         '2025-02-22 10:30:00+01:00'),
(50, 15,  '2025-02-23', 'delivered',   179.98, NULL,         '2025-02-23 06:50:00+05:30');


-- ============================================================
-- ORDER ITEMS (100 rows)
-- ============================================================

INSERT INTO order_items (item_id, order_id, product_id, quantity, unit_price) VALUES
-- Order 1 (Priya: laptop + headphones)
(1,   1,  1,  1, 1199.99),
(2,   1,  3,  1,  149.99),
-- Order 2 (John: phone)
(3,   2,  2,  1,  899.99),
-- Order 3 (Akiko: 3 polo shirts)
(4,   3,  6,  3,   39.99),
(5,   3,  8,  2,   49.99),
-- Order 4 (Hans: standing desk)
(6,   4,  4,  1,  549.99),
-- Order 5 (Maria: jacket + polo)
(7,   5,  7,  1,  129.99),
(8,   5,  6,  1,   39.98),
-- Order 6 (Priya: monitor)
(9,   6,  11, 1,  449.99),
-- Order 7 (Wei: 2 keyboards)
(10,  7,  12, 1,   89.99),
-- Order 8 (Oliver: laptop)
(11,  8,  1,  1, 1299.99),
-- Order 9 (Fatima: chair + desk mat + book)
(12,  9,  5,  1,  399.99),
(13,  9,  10, 2,   34.99),
(14,  9,  9,  1,   59.99),
-- Order 10 (cancelled — Liam: polo)
(15, 10,  6,  1,   39.99),
-- Order 11 (Ananya: headphones)
(16, 11,  3,  1,  149.99),
-- Order 12 (Carlos: 2 books + yoga mat)
(17, 12,  8,  1,   49.99),
(18, 12,  9,  1,   59.99),
(19, 12, 10,  1,   34.99),
-- Order 13 (Sarah: 2 laptops)
(20, 13,  1,  2, 1299.99),
-- Order 14 (Yuki: data science book)
(21, 14,  8,  1,   49.99),
-- Order 15 (Emma: office chair)
(22, 15,  5,  1,  399.99),
-- Order 16 (John: keyboard + headphones)
(23, 16, 12,  1,   89.99),
(24, 16,  3,  1,   89.99),
-- Order 17 (Ravi: yoga mat + dumbbells)
(25, 17, 10,  1,   34.99),
(26, 17, 14,  1,   39.99),
-- Order 18 (Sofia: phone + headphones)
(27, 18,  2,  1,  799.99),
(28, 18,  3,  1,  149.99),
-- Order 19 (James: 2 books)
(29, 19,  8,  1,   49.99),
(30, 19,  9,  5,   49.99),
-- Order 20 (Nina: keyboard)
(31, 20, 12,  1,   89.99),
-- Order 21 (David: tablet)
(32, 21, 15,  1,  699.99),
-- Order 22 (refunded — Amara: jacket)
(33, 22,  7,  1,  129.99),
-- Order 23 (Priya: MBA book)
(34, 23,  9,  1,   59.99),
-- Order 24 (Akiko: monitor + keyboard)
(35, 24, 11,  1,  449.99),
(36, 24, 12,  1,   89.99),
-- Order 25 (Maria: yoga mat)
(37, 25, 10,  1,   34.99),
-- Order 26 (Oliver: monitor)
(38, 26, 11,  1,  449.99),
-- Order 27 (pending — Fatima: laptop)
(39, 27,  1,  1, 1299.99),
-- Order 28 (Sarah: 2 keyboards)
(40, 28, 12,  2,   89.99),
-- Order 29 (Hans: office chair)
(41, 29,  5,  1,  399.99),
-- Order 30 (Wei: headphones)
(42, 30,  3,  1,  149.99),
-- Order 31 (Ananya: yoga mat + dumbbells)
(43, 31, 10,  1,   34.99),
(44, 31, 14,  1,   74.99),
-- Order 32 (Ravi: DS book)
(45, 32,  8,  1,   49.99),
-- Order 33 (John: laptop + monitor)
(46, 33,  1,  1, 1299.99),
(47, 33, 11,  1,  449.99),
-- Order 34 (Carlos: coffee maker)
(48, 34, 13,  1,   79.99),
-- Order 35 (Sofia: standing desk)
(49, 35,  4,  1,  549.99),
-- Order 36 (David: phone — processing)
(50, 36,  2,  1,  899.99),
-- Order 37 (Amara: dumbbells)
(51, 37, 14,  1,   44.99),
-- Order 38 (Liam: jacket + polo)
(52, 38,  7,  1,  129.99),
(53, 38,  6,  1,   39.99),
-- Order 39 (Yuki: jacket)
(54, 39,  7,  1,  129.99),
-- Order 40 (Emma: keyboard)
(55, 40, 12,  1,   89.99),
-- Order 41 (Priya: headphones + polo — Valentine's)
(56, 41,  3,  1,  119.99),
(57, 41,  6,  1,   39.99),
-- Order 42 (Hans: monitor — shipping)
(58, 42, 11,  1,  449.99),
-- Order 43 (James: yoga mat)
(59, 43, 10,  1,   34.99),
-- Order 44 (Nina: MBA book)
(60, 44,  9,  1,   59.99),
-- Order 45 (Akiko: phone)
(61, 45,  2,  1,  899.99),
-- Order 46 (cancelled — Maria: laptop)
(62, 46,  1,  1, 1299.99),
-- Order 47 (Sarah: coffee maker + DS book)
(63, 47, 13,  1,   79.99),
(64, 47,  8,  1,   49.99),
-- Additional items to reach ~100
(65, 47, 14,  2,   44.99),
-- Order 48 (Wei: keyboard)
(66, 48, 12,  1,   89.99),
-- Order 49 (pending — Liam: standing desk)
(67, 49,  4,  1,  549.99),
-- Order 50 (Ravi: headphones + keyboard)
(68, 50,  3,  1,  149.99),
(69, 50, 12,  1,   29.99),
-- Extra items for popular products (backfill older orders)
(70,  3, 10,  2,   34.99),
(71,  5, 14,  1,   44.99),
(72,  9, 12,  1,   89.99),
(73, 11, 10,  1,   34.99),
(74, 16,  6,  2,   39.99),
(75, 18, 12,  1,   89.99),
(76, 19, 14,  1,   44.99),
(77, 24,  3,  1,  149.99),
(78, 28,  6,  3,   39.99),
(79, 33,  3,  1,  149.99),
(80, 33, 12,  1,   89.99),
(81, 35,  5,  1,  399.99),
(82, 38, 10,  1,   34.99),
(83, 41,  8,  1,   49.99),
(84, 45,  3,  1,  149.99),
(85, 47, 10,  1,   34.99),
(86, 50,  6,  2,   39.99),
(87,  1, 12,  1,   89.99),
(88,  4, 14,  2,   44.99),
(89,  6,  9,  1,   59.99),
(90,  8,  3,  1,  149.99),
(91, 13,  3,  2,  149.99),
(92, 17, 13,  1,   79.99),
(93, 20,  6,  1,   39.99),
(94, 23, 10,  1,   34.99),
(95, 26, 12,  1,   89.99),
(96, 29,  9,  1,   59.99),
(97, 30, 10,  1,   34.99),
(98, 34, 10,  1,   34.99),
(99, 37, 10,  1,   34.99),
(100,44, 10,  1,   34.99);


-- ============================================================
-- PAGE EVENTS (30 rows — January 2025 partition)
-- ============================================================

INSERT INTO page_events (event_date, customer_id, event_type, page_url, session_id, created_at) VALUES
('2025-01-05', 1,  'page_view',    '/products/laptops',       'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-01-05 09:00:00+05:30'),
('2025-01-05', 1,  'add_to_cart',  '/products/laptops/1',     'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-01-05 09:05:00+05:30'),
('2025-01-05', 1,  'purchase',     '/checkout',               'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-01-05 09:12:00+05:30'),
('2025-01-06', 2,  'page_view',    '/products/phones',        'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2025-01-06 14:00:00-04:00'),
('2025-01-06', 2,  'page_view',    '/products/phones/2',      'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2025-01-06 14:15:00-04:00'),
('2025-01-06', 2,  'purchase',     '/checkout',               'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2025-01-06 14:30:00-04:00'),
('2025-01-07', 3,  'page_view',    '/products/clothing',      'c3d4e5f6-a7b8-9012-cdef-123456789012', '2025-01-07 09:30:00+09:00'),
('2025-01-07', 3,  'page_view',    '/products/books',         'c3d4e5f6-a7b8-9012-cdef-123456789012', '2025-01-07 09:45:00+09:00'),
('2025-01-07', 3,  'add_to_cart',  '/products/clothing/6',    'c3d4e5f6-a7b8-9012-cdef-123456789012', '2025-01-07 09:50:00+09:00'),
('2025-01-07', 3,  'purchase',     '/checkout',               'c3d4e5f6-a7b8-9012-cdef-123456789012', '2025-01-07 10:00:00+09:00'),
('2025-01-08', 4,  'page_view',    '/products/furniture',     'd4e5f6a7-b8c9-0123-defa-234567890123', '2025-01-08 16:00:00+01:00'),
('2025-01-08', 4,  'purchase',     '/checkout',               'd4e5f6a7-b8c9-0123-defa-234567890123', '2025-01-08 16:45:00+01:00'),
('2025-01-10', 5,  'page_view',    '/products/clothing',      'e5f6a7b8-c9d0-1234-efab-345678901234', '2025-01-10 10:00:00+01:00'),
('2025-01-10', 5,  'page_view',    '/products/sports',        'e5f6a7b8-c9d0-1234-efab-345678901234', '2025-01-10 10:15:00+01:00'),
('2025-01-10', NULL,'page_view',   '/',                       'f6a7b8c9-d0e1-2345-fabc-456789012345', '2025-01-10 12:00:00+00:00'),
('2025-01-11', 6,  'page_view',    '/products/electronics',   'a7b8c9d0-e1f2-3456-abcd-567890123456', '2025-01-11 09:00:00+08:00'),
('2025-01-11', 6,  'purchase',     '/checkout',               'a7b8c9d0-e1f2-3456-abcd-567890123456', '2025-01-11 09:30:00+08:00'),
('2025-01-12', 7,  'page_view',    '/products/laptops',       'b8c9d0e1-f2a3-4567-bcde-678901234567', '2025-01-12 12:30:00+00:00'),
('2025-01-12', 7,  'add_to_cart',  '/products/laptops/1',     'b8c9d0e1-f2a3-4567-bcde-678901234567', '2025-01-12 12:50:00+00:00'),
('2025-01-12', 7,  'purchase',     '/checkout',               'b8c9d0e1-f2a3-4567-bcde-678901234567', '2025-01-12 13:15:00+00:00'),
('2025-01-14', 9,  'page_view',    '/products/clothing',      'c9d0e1f2-a3b4-5678-cdef-789012345678', '2025-01-14 09:30:00+01:00'),
('2025-01-14', 9,  'add_to_cart',  '/products/clothing/6',    'c9d0e1f2-a3b4-5678-cdef-789012345678', '2025-01-14 09:45:00+01:00'),
('2025-01-14', 9,  'page_view',    '/about',                  'd0e1f2a3-b4c5-6789-defa-890123456789', '2025-01-14 14:00:00+01:00'),
('2025-01-15', 10, 'page_view',    '/products/audio',         'e1f2a3b4-c5d6-7890-efab-901234567890', '2025-01-15 07:00:00+05:30'),
('2025-01-15', 10, 'purchase',     '/checkout',               'e1f2a3b4-c5d6-7890-efab-901234567890', '2025-01-15 07:45:00+05:30'),
('2025-01-16', 11, 'page_view',    '/products/books',         'f2a3b4c5-d6e7-8901-fabc-012345678901', '2025-01-16 13:00:00-06:00'),
('2025-01-16', 11, 'add_to_cart',  '/products/books/8',       'f2a3b4c5-d6e7-8901-fabc-012345678901', '2025-01-16 13:20:00-06:00'),
('2025-01-16', 11, 'add_to_cart',  '/products/sports/10',     'f2a3b4c5-d6e7-8901-fabc-012345678901', '2025-01-16 13:35:00-06:00'),
('2025-01-16', 11, 'purchase',     '/checkout',               'f2a3b4c5-d6e7-8901-fabc-012345678901', '2025-01-16 14:00:00-06:00'),
('2025-01-17', 12, 'page_view',    '/products/laptops',       'a3b4c5d6-e7f8-9012-abcd-123456789012', '2025-01-17 10:00:00-04:00');


-- ============================================================
-- VERIFICATION QUERIES (run after inserting)
-- ============================================================

-- Quick sanity checks
SELECT 'customers'   AS tbl, COUNT(*) AS cnt FROM customers
UNION ALL
SELECT 'products',           COUNT(*)        FROM products
UNION ALL
SELECT 'orders',             COUNT(*)        FROM orders
UNION ALL
SELECT 'order_items',        COUNT(*)        FROM order_items
UNION ALL
SELECT 'page_events',        COUNT(*)        FROM page_events;

-- Expected output:
-- customers   | 20
-- products    | 15
-- orders      | 50
-- order_items | 100
-- page_events | 30
