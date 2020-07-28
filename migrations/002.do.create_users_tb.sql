CREATE TABLE users_tb (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ
);

ALTER TABLE menu_tb
    ADD COLUMN
        user_id INTEGER REFERENCES users_tb(id)
        ON DELETE CASCADE;


