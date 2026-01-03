-- IDで在庫ステータスを取得（item情報をJOIN）
SELECT
    ins.id,
    ins.business_date,
    ins.item_id,
    ins.inventory_check_status,
    ins.replenishment_status,
    ins.preparation_status,
    ins.order_request_status,
    ins.inventory_count,
    ins.replenishment_count,
    ins.replenishment_note,
    ins.version,
    ins.created_at,
    ins.updated_at,
    i.id AS "item_id2",
    i.name AS "item_name",
    i.description AS "item_description",
    i.unit AS "item_unit",
    i.pattern_type AS "item_pattern_type",
    i.created_at AS "item_created_at",
    i.updated_at AS "item_updated_at"
FROM
    inventory_status ins
    INNER JOIN item i ON ins.item_id = i.id
WHERE
    ins.id = /*id*/'00000000-0000-0000-0000-000000000000'::uuid

