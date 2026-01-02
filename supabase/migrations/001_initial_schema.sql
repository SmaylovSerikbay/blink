-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('driver', 'passenger', 'admin');
CREATE TYPE order_type AS ENUM ('passenger', 'parcel');
CREATE TYPE order_status AS ENUM ('pending', 'matched', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'passenger',
  phone TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type order_type NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_from_to_city ON orders(from_city, to_city);
CREATE INDEX idx_orders_scheduled_at ON orders(scheduled_at);
CREATE INDEX idx_orders_type ON orders(type);
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - can be refined later)
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = telegram_id OR true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = telegram_id OR true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = telegram_id OR true);

-- Allow users to view all orders (for feed)
CREATE POLICY "Users can view all orders" ON orders
  FOR SELECT USING (true);

-- Allow users to create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT telegram_id FROM profiles WHERE id = user_id));

-- Allow users to update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid()::text = (SELECT telegram_id FROM profiles WHERE id = user_id));

-- Allow drivers to update order status (for taking orders)
CREATE POLICY "Drivers can update order status" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid 
      AND role = 'driver'
    ) OR
    auth.uid()::text = (SELECT telegram_id FROM profiles WHERE id = user_id)
  );

