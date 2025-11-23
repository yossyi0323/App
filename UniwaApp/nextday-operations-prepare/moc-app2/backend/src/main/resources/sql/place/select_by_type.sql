SELECT
    id,
    type,
    name,
    display_order AS "displayOrder",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
FROM
    place
WHERE
    type = /*type*/'01'
ORDER BY
    display_order NULLS LAST,
    name


