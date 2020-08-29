BEGIN;

TRUNCATE
    plan_tb,
    menu_tb,
    users_tb
    RESTART IDENTITY CASCADE;

INSERT INTO users_tb (first_name, last_name, user_name, password)
VALUES
    ('Dunder', 'Mifflin', 'dunder_mifflin', '$2a$12$qXPyWzMaEHendl0y.ARQQuNa0zx5ZlzrzgwlAGZjdNCV5a1fTtczK');


INSERT INTO menu_tb (name, user_id, image_url, calories, carbs, protein, fat, category)
VALUES
    ('Sausage, Eggs, Biscuit, & Hashbrowns', 1, 'https://media-cdn.tripadvisor.com/media/photo-s/07/1d/2a/a7/spooner-family-restaurant.jpg', 750, 49, 53, 25, 'Breakfast'),
    ('Breakfast Burrito', 1, 'https://www.tasteofhome.com/wp-content/uploads/2018/01/Sausage-Breakfast-Burritos_EXPS_SDDJ19_1760_C07_20_1b.jpg', 300, 16, 26, 13, 'Breakfast'),
    ('Pancakes', 1, 'https://th.bing.com/th/id/OIP.PxQhB5NydJk5bG6K0oqndgHaKK?pid=Api&rs=1', 590, 15, 102, 9, 'Breakfast'),

    ('Tuna Sandwich', 1, 'https://www.simplyrecipes.com/wp-content/uploads/2018/07/Add-ins-for-tuna-salad-3.jpg', 450, 25, 38, 19, 'Lunch'),
    ('Chicken Nuggets', 1, 'https://www.tasteofhome.com/wp-content/uploads/2018/01/exps168399_TH163620D11_12_6b.jpg', 830, 49, 51, 46, 'Lunch'),
    ('Cheeseburger', 1, 'https://www.sbs.com.au/food/sites/sbs.com.au.food/files/lotus-burger-lead.jpg', 360, 15, 37, 17, 'Lunch'),

    ('Chicken Parmigiana', 1, 'http://www.cookingclassy.com/wp-content/uploads/2013/02/chicken-parmsesan6.jpg', 570, 18, 40, 58, 'Dinner'),
    ('Spaghetti & Meatballs', 1, 'https://www.kitchensanctuary.com/wp-content/uploads/2016/02/One-pan-spaghetti-and-meatballs-tall.jpg', 620, 34, 50, 26, 'Dinner'),
    ('Ribeye Steak', 1, 'https://www.harrisranch.com/wp-content/uploads/2019/01/photo_ribeye_steak4SMALL_1024x1024.jpg', 810, 54, 0, 96, 'Dinner');
    
COMMIT;




