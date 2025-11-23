-- 在庫ステータスを削除
DELETE FROM inventory_status
WHERE
    id = /*id*/'00000000-0000-0000-0000-000000000000'::uuid

