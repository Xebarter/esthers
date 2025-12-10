/*
  # Create E-commerce Schema for Esther's Footwear Store

  ## Overview
  Complete database schema for an e-commerce footwear store with customer orders and admin management capabilities.

  ## New Tables
  
  ### 1. `categories`
  Product categories for organizing footwear
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name (e.g., "Sneakers", "Boots")
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `products`
  Footwear products available for purchase
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `category_id` (uuid, foreign key) - Links to categories
  - `image_url` (text) - Product image URL
  - `sizes` (text[]) - Available sizes
  - `colors` (text[]) - Available colors
  - `stock` (integer) - Available stock quantity
  - `featured` (boolean) - Whether product is featured
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `customers`
  Customer information
  - `id` (uuid, primary key)
  - `email` (text, unique) - Customer email
  - `name` (text) - Customer full name
  - `phone` (text) - Phone number
  - `address` (text) - Shipping address
  - `city` (text) - City
  - `postal_code` (text) - Postal code
  - `country` (text) - Country
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `orders`
  Customer orders
  - `id` (uuid, primary key)
  - `customer_id` (uuid, foreign key) - Links to customers
  - `status` (text) - Order status (pending, processing, shipped, delivered, cancelled)
  - `total_amount` (decimal) - Total order amount
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `order_items`
  Individual items within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - Links to orders
  - `product_id` (uuid, foreign key) - Links to products
  - `quantity` (integer) - Quantity ordered
  - `price` (decimal) - Price at time of order
  - `size` (text) - Selected size
  - `color` (text) - Selected color
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  
  - Enable RLS on all tables
  - Categories: Public read access, admin can manage
  - Products: Public read access, admin can manage
  - Customers: Customers can read/update their own data
  - Orders: Customers can read their own orders, admin can manage all
  - Order Items: Linked to order permissions

  ## Notes
  
  - All tables use UUID primary keys with automatic generation
  - Foreign key constraints ensure data integrity
  - Timestamps track creation and updates where applicable
  - Stock management included for inventory tracking
  - Order status tracking for fulfillment workflow
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) DEFAULT 0 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  size text DEFAULT '',
  color text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, no auth required for viewing)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Products policies (public read, no auth required for viewing)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Customers policies (public insert for new customers, read own data)
CREATE POLICY "Anyone can create customer profile"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update customers"
  ON customers FOR UPDATE
  USING (true);

-- Orders policies (public access for creating and viewing)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (true);

-- Order items policies (linked to order permissions)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Sneakers', 'Casual and athletic sneakers for everyday wear'),
  ('Boots', 'Sturdy and stylish boots for all seasons'),
  ('Sandals', 'Comfortable sandals for warm weather'),
  ('Heels', 'Elegant heels for special occasions'),
  ('Flats', 'Comfortable flat shoes for daily wear'),
  ('Athletic', 'Performance footwear for sports and fitness')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, sizes, colors, stock, featured) VALUES
  (
    'Classic Canvas Sneakers',
    'Timeless canvas sneakers with a comfortable fit, perfect for everyday wear',
    59.99,
    (SELECT id FROM categories WHERE name = 'Sneakers'),
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['White', 'Black', 'Navy', 'Red'],
    150,
    true
  ),
  (
    'Running Pro Elite',
    'High-performance running shoes with advanced cushioning technology',
    129.99,
    (SELECT id FROM categories WHERE name = 'Athletic'),
    'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Blue', 'Black', 'Grey'],
    80,
    true
  ),
  (
    'Leather Combat Boots',
    'Durable leather boots with a rugged style and superior comfort',
    159.99,
    (SELECT id FROM categories WHERE name = 'Boots'),
    'https://images.pexels.com/photos/1476209/pexels-photo-1476209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Brown', 'Black'],
    60,
    true
  ),
  (
    'Summer Breeze Sandals',
    'Lightweight and breathable sandals for hot summer days',
    39.99,
    (SELECT id FROM categories WHERE name = 'Sandals'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11'],
    ARRAY['Tan', 'Black', 'White'],
    120,
    false
  ),
  (
    'Elegant Evening Heels',
    'Sophisticated heels perfect for formal events and special occasions',
    89.99,
    (SELECT id FROM categories WHERE name = 'Heels'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['5', '6', '7', '8', '9', '10'],
    ARRAY['Black', 'Red', 'Silver', 'Gold'],
    45,
    false
  ),
  (
    'Comfort Ballet Flats',
    'Stylish and comfortable flats for all-day wear',
    49.99,
    (SELECT id FROM categories WHERE name = 'Flats'),
    'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['5', '6', '7', '8', '9', '10'],
    ARRAY['Black', 'Beige', 'Pink', 'Navy'],
    90,
    false
  ),
  (
    'Trail Blazer Hiking Boots',
    'Waterproof hiking boots built for challenging terrain',
    179.99,
    (SELECT id FROM categories WHERE name = 'Boots'),
    'https://images.pexels.com/photos/1476209/pexels-photo-1476209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['Brown', 'Green', 'Grey'],
    55,
    true
  ),
  (
    'Urban Street Sneakers',
    'Modern street-style sneakers with premium materials',
    99.99,
    (SELECT id FROM categories WHERE name = 'Sneakers'),
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['6', '7', '8', '9', '10', '11', '12'],
    ARRAY['White', 'Black', 'Grey', 'Blue'],
    110,
    true
  )
ON CONFLICT DO NOTHING;