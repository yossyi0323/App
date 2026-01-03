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
ORDER BY
    name


