CREATE TABLE plan_tb (
    menu_item_id INTEGER REFERENCES menu_tb(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    calories INTEGER,
    carbs INTEGER,
    protein INTEGER,
    fat INTEGER,
    category TEXT NOT NULL
);


ALTER TABLE menu_tb
    ADD COLUMN
        menu_id INTEGER REFERENCES menu_tb(id)
        ON DELETE SET NULL;



