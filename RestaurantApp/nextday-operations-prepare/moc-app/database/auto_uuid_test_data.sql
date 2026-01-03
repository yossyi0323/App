-- UUID自動生成を使用した参照整合性テストデータ
-- 2025-09-27の業務日付で設定

-- 1. Place データの投入（UUID自動生成）
INSERT INTO place (type, name, display_order) VALUES 
-- 補充元（source）
('補充元', '2階', 1),
('補充元', '3階', 2),
('補充元', 'ビレッジ', 3),
('補充元', '冷蔵庫', 4),
('補充元', 'スパイスラック', 5),
-- 補充先（destination）
('補充先', '冷蔵庫', 1),
('補充先', 'スチコン下冷蔵庫', 2),
('補充先', '調味料棚', 3),
('補充先', 'スパイスラック', 4),
('補充先', '牛乳冷蔵庫', 5),
('補充先', '資材', 6);

-- 2. Item データの投入（UUID自動生成）
INSERT INTO item (name, description, unit) VALUES 
-- 野菜類
('トマト', '新鮮なトマト', '個'),
('レタス', 'サラダ用レタス', '個'),
('玉ねぎ', '炒め物用玉ねぎ', '個'),
('にんじん', '煮物用にんじん', '本'),
('じゃがいも', 'フライドポテト用', '個'),
-- 肉類
('牛肉', 'ステーキ用牛肉', 'kg'),
('豚肉', '豚ロース肉', 'kg'),
('鶏肉', '鶏もも肉', 'kg'),
-- 調味料類
('塩', '天然塩', 'g'),
('胡椒', 'ブラックペッパー', 'g'),
('醤油', '濃口醤油', 'ml'),
('味噌', '赤味噌', 'g'),
('油', 'サラダ油', 'ml'),
('小麦粉', '薄力粉', 'g'),
-- 乳製品
('卵', '新鮮な卵', '個'),
('牛乳', '新鮮な牛乳', 'ml'),
('バター', '無塩バター', 'g'),
('チーズ', 'チェダーチーズ', 'g');

-- 3. ItemReplenishment データの投入（参照整合性を保つ）
-- 野菜の補充（ビレッジ → 冷蔵庫）
INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination)
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = 'ビレッジ' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '冷蔵庫' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('トマト', 'レタス', '玉ねぎ', 'にんじん', 'じゃがいも');

-- 肉の補充（ビレッジ → スチコン下冷蔵庫）
INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination)
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = 'ビレッジ' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = 'スチコン下冷蔵庫' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('牛肉', '豚肉', '鶏肉');

-- 調味料の補充（スパイスラック → 調味料棚）
INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination)
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = 'スパイスラック' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '調味料棚' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('塩', '胡椒', '醤油', '味噌', '油', '小麦粉');

-- 乳製品の補充（冷蔵庫 → 牛乳冷蔵庫）
INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination)
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = '冷蔵庫' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '牛乳冷蔵庫' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('卵', '牛乳', 'バター', 'チーズ');

-- 4. InventoryStatus データの投入（参照整合性を保つ）
-- 2025-09-27の業務日付で設定
INSERT INTO inventory_status (business_date, item_id, inventory_check_status, replenishment_status, preparation_status, order_request_status, inventory_count, replenishment_count)
SELECT 
    '2025-09-27'::date,
    i.id,
    '未確認',
    CASE 
        WHEN i.name IN ('玉ねぎ', 'じゃがいも', '豚肉', '胡椒', '油', '卵', 'チーズ') THEN '要補充'
        ELSE '補充不要'
    END,
    '作成不要',
    '発注不要',
    CASE 
        WHEN i.name = 'トマト' THEN 10
        WHEN i.name = 'レタス' THEN 5
        WHEN i.name = '玉ねぎ' THEN 3
        WHEN i.name = 'にんじん' THEN 8
        WHEN i.name = 'じゃがいも' THEN 2
        WHEN i.name = '牛肉' THEN 15
        WHEN i.name = '豚肉' THEN 1
        WHEN i.name = '鶏肉' THEN 12
        WHEN i.name = '塩' THEN 50
        WHEN i.name = '胡椒' THEN 5
        WHEN i.name = '醤油' THEN 100
        WHEN i.name = '味噌' THEN 80
        WHEN i.name = '油' THEN 10
        WHEN i.name = '小麦粉' THEN 25
        WHEN i.name = '卵' THEN 6
        WHEN i.name = '牛乳' THEN 200
        WHEN i.name = 'バター' THEN 15
        WHEN i.name = 'チーズ' THEN 2
        ELSE 0
    END,
    CASE 
        WHEN i.name = '玉ねぎ' THEN 5
        WHEN i.name = 'じゃがいも' THEN 10
        WHEN i.name = '豚肉' THEN 8
        WHEN i.name = '胡椒' THEN 20
        WHEN i.name = '油' THEN 30
        WHEN i.name = '卵' THEN 24
        WHEN i.name = 'チーズ' THEN 10
        ELSE 0
    END
FROM item i;
