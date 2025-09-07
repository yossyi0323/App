-- updated_atのデフォルト値をnow()に変更
ALTER TABLE inventory_status ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE item ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE item_preparation ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE place ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE reservation ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE reservation_status ALTER COLUMN updated_at SET DEFAULT now(); 