CREATE TABLE m_user (
    user_id uuid PRIMARY KEY,
    user_name text NOT NULL,
    email text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL
);

CREATE TABLE t_task (
    task_id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    title text NOT NULL,
    task_description text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL
);

CREATE TABLE t_time_slot (
    time_slot_id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    task_id uuid NOT NULL,
    allocation text NOT NULL,
    start_at timestamp NOT NULL,
    end_at timestamp NOT NULL,
    ext_data jsonb NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL
);
