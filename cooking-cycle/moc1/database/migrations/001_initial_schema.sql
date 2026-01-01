-- Phase 1: 初期スキーマ
-- データベース: cooking_cycle

-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS（ユーザー）
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  picture_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);

-- 2. PRODUCTS（製品カタログ）
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_stockable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_is_stockable ON products(is_stockable);

-- 3. RECIPES（レシピ）
CREATE TABLE recipes (
  recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  parent_recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  recipe_url VARCHAR(500),
  instructions_text TEXT NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_parent_recipe_id ON recipes(parent_recipe_id);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_deleted_at ON recipes(deleted_at);
CREATE INDEX idx_recipes_user_deleted ON recipes(user_id, deleted_at);

-- 4. RECIPE_COMPONENTS（レシピの材料）
CREATE TABLE recipe_components (
  component_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ingredient_name VARCHAR(255),
  input_type VARCHAR(50) NOT NULL,
  quantity_memo TEXT,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  required_state_transition_id UUID, -- Phase 2以降で使用
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT chk_input_type CHECK (input_type IN ('PRODUCT', 'TEXT_INPUT')),
  CONSTRAINT chk_component_data CHECK (
    (input_type = 'PRODUCT' AND product_id IS NOT NULL AND ingredient_name IS NULL) OR
    (input_type = 'TEXT_INPUT' AND product_id IS NULL AND ingredient_name IS NOT NULL)
  )
);

CREATE INDEX idx_recipe_components_recipe_id ON recipe_components(recipe_id);
CREATE INDEX idx_recipe_components_product_id ON recipe_components(product_id);

-- 5. RECIPE_OUTPUTS（レシピのアウトプット）
CREATE TABLE recipe_outputs (
  output_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_memo TEXT,
  is_main_output BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_recipe_outputs_recipe_id ON recipe_outputs(recipe_id);
CREATE INDEX idx_recipe_outputs_product_id ON recipe_outputs(product_id);

-- 6. STOCKS（ストック）
CREATE TABLE stocks (
  stock_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL, -- 製品名のキャッシュ（検索用）
  product_type VARCHAR(50) NOT NULL, -- 製品タイプのキャッシュ（検索用）
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  quantity_memo TEXT,
  state_memo TEXT, -- Phase 1で使用（自由入力）
  stocked_since_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_from_recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE SET NULL,
  ingredient_id UUID, -- Phase 2以降で使用
  state_transition_id UUID, -- Phase 2以降で使用
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT chk_status CHECK (status IN ('AVAILABLE', 'NEED_REFILL', 'NO_REFILL'))
);

CREATE INDEX idx_stocks_user_id ON stocks(user_id);
CREATE INDEX idx_stocks_product_id ON stocks(product_id);
CREATE INDEX idx_stocks_status ON stocks(status);
CREATE INDEX idx_stocks_stocked_since_date ON stocks(stocked_since_date);
CREATE INDEX idx_stocks_created_from_recipe_id ON stocks(created_from_recipe_id);

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.updated_count = OLD.updated_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_components_updated_at BEFORE UPDATE ON recipe_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_outputs_updated_at BEFORE UPDATE ON recipe_outputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
