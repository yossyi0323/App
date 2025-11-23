SELECT
    id,
    name,
    description,
    unit,
    pattern_type AS "patternType",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
FROM
    item
WHERE
    id = /*id*/'00000000-0000-0000-0000-000000000000'::uuid


