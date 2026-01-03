-- サンプルデータ投入

-- 場所マスタのデータ投入
INSERT INTO place (type, name, display_order) VALUES
-- 補充元
('補充元', '2階', 1),
('補充元', '3階', 2),
('補充元', 'キッチン', 3),
('補充元', 'その他', 4),
('補充元', 'ビレッジ', 5),
-- 補充先
('補充先', '冷蔵庫', 1),
('補充先', 'スチコン下冷蔵庫', 2),
('補充先', '調味料棚', 3),
('補充先', 'スパイスラック', 4),
('補充先', '牛乳冷蔵庫', 5),
('補充先', '資材', 6);

-- 品物マスタのデータ投入
INSERT INTO item (name, description, unit) VALUES
('トマト', '新鮮なトマト', '個'),
('レタス', 'サニーレタス', '個'),
('玉ねぎ', '黄玉ねぎ', '個'),
('にんじん', '千切り用にんじん', '本'),
('じゃがいも', '男爵いも', '個'),
('牛肉', '国産牛肉', 'kg'),
('豚肉', '国産豚肉', 'kg'),
('鶏肉', '国産鶏肉', 'kg'),
('塩', '食塩', 'g'),
('胡椒', '黒胡椒', 'g'),
('醤油', '濃口醤油', 'ml'),
('味噌', '白味噌', 'g'),
('油', 'サラダ油', 'ml'),
('小麦粉', '薄力粉', 'g'),
('卵', '新鮮卵', '個'),
('牛乳', '牛乳', 'ml'),
('バター', '無塩バター', 'g'),
('チーズ', 'プロセスチーズ', 'g'),
('パン', '食パン', '枚'),
('米', '白米', 'kg');

-- 品物別前日営業準備マスタのデータ投入
INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination) 
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = '冷蔵庫' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '冷蔵庫' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('トマト', 'レタス', '玉ねぎ', 'にんじん', 'じゃがいも', '牛肉', '豚肉', '鶏肉');

INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination) 
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = '調味料棚' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '調味料棚' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('塩', '胡椒', '醤油', '味噌', '油', '小麦粉');

INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination) 
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = '牛乳冷蔵庫' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '牛乳冷蔵庫' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('卵', '牛乳', 'バター', 'チーズ');

INSERT INTO item_replenishment (item_id, source_location_id, destination_location_id, replenishment_type, order_request_destination) 
SELECT 
    i.id,
    (SELECT p.id FROM place p WHERE p.name = '資材' AND p.type = '補充元' LIMIT 1),
    (SELECT p.id FROM place p WHERE p.name = '資材' AND p.type = '補充先' LIMIT 1),
    '移動',
    'キッチン担当'
FROM item i 
WHERE i.name IN ('パン', '米');

-- 在庫補充状況管理トランのサンプルデータ投入（今日の日付）
INSERT INTO inventory_status (business_date, item_id, inventory_check_status, replenishment_status, preparation_status, order_request_status, inventory_count, replenishment_count)
SELECT 
    CURRENT_DATE,
    i.id,
    '未確認',
    '補充不要',
    '作成不要',
    '発注不要',
    CASE 
        WHEN i.name IN ('トマト', 'レタス') THEN 10
        WHEN i.name IN ('玉ねぎ', 'にんじん', 'じゃがいも') THEN 20
        WHEN i.name IN ('牛肉', '豚肉', '鶏肉') THEN 5
        WHEN i.name IN ('塩', '胡椒', '醤油', '味噌', '油', '小麦粉') THEN 100
        WHEN i.name IN ('卵', '牛乳', 'バター', 'チーズ') THEN 20
        WHEN i.name IN ('パン', '米') THEN 10
        ELSE 0
    END,
    0
FROM item i;

-- 商品予約トランのサンプルデータ投入
INSERT INTO reservation (business_date, product_name, reservation_count) VALUES
(CURRENT_DATE, 'ハンバーガーセット', 15),
(CURRENT_DATE, 'チキンセット', 10),
(CURRENT_DATE, 'サラダ', 8),
(CURRENT_DATE, 'スープ', 12);

-- 予約状況トランのサンプルデータ投入
INSERT INTO reservation_status (business_date, memo) VALUES
(CURRENT_DATE, '明日は平日なので通常より少なめの予約数。ハンバーガーセットが人気。');
