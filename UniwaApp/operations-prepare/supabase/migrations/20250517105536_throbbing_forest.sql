/*
  # Initial schema for restaurant preparation app

  1. New Tables
     - `locations` - Stores source and destination locations
     - `items` - Stores item information
     - `item_source_destination` - Maps items to their source and destination locations
     - `item_prep_patterns` - Defines preparation patterns for items
     - `inventory_status` - Tracks inventory status for daily operations
     - `reservations` - Stores item reservations
     - `reservation_notes` - Stores general reservation notes
  
  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users
*/

-- Location table to store source and destination locations
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('source', 'destination')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Item table to store item information
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Item source and destination mapping
CREATE TABLE IF NOT EXISTS item_source_destination (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id),
  source_location_id uuid NOT NULL REFERENCES locations(id),
  destination_location_id uuid NOT NULL REFERENCES locations(id),
  created_at timestamptz DEFAULT now()
);

-- Item preparation patterns
CREATE TABLE IF NOT EXISTS item_prep_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id),
  pattern_type text NOT NULL CHECK (pattern_type IN ('move', 'create')),
  source_location_id uuid REFERENCES locations(id),
  destination_location_id uuid REFERENCES locations(id),
  creator text,
  created_at timestamptz DEFAULT now()
);

-- Inventory status for daily operations
CREATE TABLE IF NOT EXISTS inventory_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  item_id uuid NOT NULL REFERENCES items(id),
  check_status text NOT NULL CHECK (check_status IN ('unchecked', 'checking', 'checked', 'not-required')) DEFAULT 'unchecked',
  restock_status text NOT NULL CHECK (restock_status IN ('not-required', 'needs-restock', 'restocked')) DEFAULT 'not-required',
  create_status text NOT NULL CHECK (create_status IN ('not-required', 'needs-creation', 'created', 'creation-requested')) DEFAULT 'not-required',
  order_status text NOT NULL CHECK (order_status IN ('not-required', 'needs-order', 'ordered')) DEFAULT 'not-required',
  current_stock integer DEFAULT 0,
  restock_amount integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (date, item_id)
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reservation notes
CREATE TABLE IF NOT EXISTS reservation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_source_destination ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_prep_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read item_source_destination"
  ON item_source_destination
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read item_prep_patterns"
  ON item_prep_patterns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can perform all operations on inventory_status"
  ON inventory_status
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can perform all operations on reservations"
  ON reservations
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can perform all operations on reservation_notes"
  ON reservation_notes
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample data for locations
INSERT INTO locations (type, name) VALUES
  ('source', '2階'),
  ('source', '3階'),
  ('source', 'キッチン'),
  ('source', 'その他'),
  ('source', 'ビレッジ'),
  ('destination', '冷蔵庫'),
  ('destination', 'スチコン下冷蔵庫'),
  ('destination', '調味料棚'),
  ('destination', 'スパイスラック'),
  ('destination', '牛乳冷蔵庫'),
  ('destination', '資材');