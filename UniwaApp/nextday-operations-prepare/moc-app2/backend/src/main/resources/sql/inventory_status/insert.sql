-- 在庫ステータスを新規作成
INSERT INTO inventory_status (
    id,
    business_date,
    item_id,
    inventory_check_status,
    replenishment_status,
    preparation_status,
    order_request_status,
    inventory_count,
    replenishment_count,
    replenishment_note,
    version,
    created_at,
    updated_at
) VALUES (
    /*id*/'00000000-0000-0000-0000-000000000000'::uuid,
    /*businessDate*/'2025-01-01',
    /*itemId*/'00000000-0000-0000-0000-000000000000'::uuid,
    /*inventoryCheckStatus*/'01',
    /*replenishmentStatus*/'99',
    /*preparationStatus*/'99',
    /*orderRequestStatus*/'99',
    /*inventoryCount*/0,
    /*replenishmentCount*/0,
    /*replenishmentNote*/'',
    /*version*/0,
    NOW(),
    NOW()
)

