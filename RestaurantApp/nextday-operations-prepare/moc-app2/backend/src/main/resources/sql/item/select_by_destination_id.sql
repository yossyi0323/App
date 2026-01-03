SELECT DISTINCT
    i.id,
    i.name,
    i.description,
    i.unit,
    i.pattern_type AS "patternType",
    i.created_at AS "createdAt",
    i.updated_at AS "updatedAt"
FROM
    item i
    INNER JOIN item_replenishment ir ON i.id = ir.item_id
WHERE
    ir.destination_location_id = /*destinationId*/'00000000-0000-0000-0000-000000000000'::uuid
ORDER BY
    i.name


