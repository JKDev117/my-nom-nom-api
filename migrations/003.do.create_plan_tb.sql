CREATE TABLE plan_tb (
    user_id INTEGER REFERENCES users_tb(id) ON DELETE SET NULL,
    menu_item_id INTEGER REFERENCES menu_tb(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    calories INTEGER,
    carbs INTEGER,
    protein INTEGER,
    fat INTEGER,
    category TEXT NOT NULL
);



