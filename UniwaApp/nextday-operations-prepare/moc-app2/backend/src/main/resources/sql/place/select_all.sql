SELECT
    id,
    type,
    name,
    display_order AS "displayOrder",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
FROM
    place
ORDER BY
    display_order NULLS LAST,
    name


