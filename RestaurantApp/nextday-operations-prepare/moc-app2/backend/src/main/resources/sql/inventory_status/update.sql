-- 在庫ステータスを更新（楽観ロック対応）
UPDATE inventory_status
SET
    inventory_check_status = /*inventoryCheckStatus*/'未確認',
    replenishment_status = /*replenishmentStatus*/'補充不要',
    preparation_status = /*preparationStatus*/'作成不要',
    order_request_status = /*orderRequestStatus*/'発注不要',
    inventory_count = /*inventoryCount*/0,
    replenishment_count = /*replenishmentCount*/0,
    replenishment_note = /*replenishmentNote*/'',
    version = version + 1,
    updated_at = NOW()
WHERE
    id = /*id*/'00000000-0000-0000-0000-000000000000'::uuid
    AND version = /*version*/0

