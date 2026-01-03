-- updated_at自動更新トリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- inventory_statusテーブルにupdated_at自動更新トリガーを追加
CREATE TRIGGER update_inventory_status_updated_at
    BEFORE UPDATE ON inventory_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 他のテーブルにも同様のトリガーを追加
CREATE TRIGGER update_item_updated_at
    BEFORE UPDATE ON item
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_preparation_updated_at
    BEFORE UPDATE ON item_preparation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_place_updated_at
    BEFORE UPDATE ON place
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_updated_at
    BEFORE UPDATE ON reservation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_status_updated_at
    BEFORE UPDATE ON reservation_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 