-- name: GetTasks :many
SELECT *
FROM t_task
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetTask :one
SELECT *
FROM t_task
WHERE task_id = $1 LIMIT 1;

-- name: CreateTask :one
INSERT INTO t_task (
  task_id,
  user_id,
  title,
  task_description,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: UpdateTask :one
UPDATE t_task
SET 
  title = $2,
  task_description = $3,
  updated_at = $4,
  updated_by = $5
WHERE task_id = $1
RETURNING *;

-- name: DeleteTask :exec
DELETE FROM t_task
WHERE task_id = $1;

-- name: GetTimeSlots :many
SELECT *
FROM t_time_slot
WHERE user_id = $1
  AND start_at >= $2
  AND end_at <= $3
ORDER BY start_at ASC;

-- name: GetTimeSlot :one
SELECT *
FROM t_time_slot
WHERE time_slot_id = $1 LIMIT 1;

-- name: CreateTimeSlot :one
INSERT INTO t_time_slot (
  time_slot_id,
  user_id,
  task_id,
  allocation,
  start_at,
  end_at,
  ext_data,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *;

-- name: UpdateTimeSlot :one
UPDATE t_time_slot
SET 
  task_id = $2,
  allocation = $3,
  start_at = $4,
  end_at = $5,
  ext_data = $6,
  updated_at = $7,
  updated_by = $8
WHERE time_slot_id = $1
RETURNING *;

-- name: DeleteTimeSlot :exec
DELETE FROM t_time_slot
WHERE time_slot_id = $1;

-- name: CreateUser :one
INSERT INTO m_user (
  user_id, user_name, email, created_at, updated_at, created_by, updated_by
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetUser :one
SELECT * FROM m_user
WHERE user_id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM m_user
WHERE email = $1 LIMIT 1;
