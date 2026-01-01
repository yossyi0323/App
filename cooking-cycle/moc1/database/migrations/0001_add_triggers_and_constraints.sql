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

-- recipe_componentsのCHECK制約（input_typeとproduct_id/ingredient_nameの排他制約）
ALTER TABLE recipe_components
  ADD CONSTRAINT chk_component_data CHECK (
    (input_type = 'PRODUCT' AND product_id IS NOT NULL AND ingredient_name IS NULL) OR
    (input_type = 'TEXT_INPUT' AND product_id IS NULL AND ingredient_name IS NOT NULL)
  );
