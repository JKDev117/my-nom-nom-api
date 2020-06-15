function createMenu(){
    return [
        {id: 1, name: "Sausage, Eggs, Biscuit, & Hashbrowns", image_url:"https://media-cdn.tripadvisor.com/media/photo-s/07/1d/2a/a7/spooner-family-restaurant.jpg", calories: 750, carbs: 53, protein: 25, fat: 49, category: "Breakfast"},
        {id: 2, name: "Breakfast Burrito", image_url:"https://www.tasteofhome.com/wp-content/uploads/2018/01/Sausage-Breakfast-Burritos_EXPS_SDDJ19_1760_C07_20_1b.jpg", calories: 300, carbs: 26, protein: 13, fat: 16, category: "Breakfast"},
        {id: 3, name: "Pancakes", image_url:"https://th.bing.com/th/id/OIP.PxQhB5NydJk5bG6K0oqndgHaKK?pid=Api&rs=1", calories: 590, carbs: 102, protein: 9, fat: 15, category: "Breakfast"},
    
        {id: 4, name: "Tuna Sandwich", image_url:"https://www.simplyrecipes.com/wp-content/uploads/2018/07/Add-ins-for-tuna-salad-3.jpg", calories: 450, carbs: 38, protein: 19, fat: 25, category: "Lunch"},
        {id: 5, name: "Chicken Nuggets", image_url:"https://www.tasteofhome.com/wp-content/uploads/2018/01/exps168399_TH163620D11_12_6b.jpg", calories: 830, carbs: 51, protein: 46, fat: 49, category: "Lunch"},
        {id: 6, name: "Cheeseburger", image_url:"https://www.sbs.com.au/food/sites/sbs.com.au.food/files/lotus-burger-lead.jpg", calories: 360, carbs: 37, protein: 17, fat: 15, category: "Lunch"},
    
        {id: 7, name: "Chicken Parmigiana", image_url:"http://www.cookingclassy.com/wp-content/uploads/2013/02/chicken-parmsesan6.jpg", calories: 570, carbs: 40, protein: 58, fat: 18, category: "Dinner"},
        {id: 8, name: "Spaghetti & Meatballs", image_url: "https://www.kitchensanctuary.com/wp-content/uploads/2016/02/One-pan-spaghetti-and-meatballs-tall.jpg", calories: 620, carbs: 50, protein: 26, fat: 34, category: "Dinner"},
        {id: 9, name: "Ribeye Steak", image_url:"https://www.harrisranch.com/wp-content/uploads/2019/01/photo_ribeye_steak4SMALL_1024x1024.jpg", calories: 810, carbs: 0, protein: 96, fat: 54, category: "Dinner"},
    ]
}


function makeMaliciousMenuItem(){
    const maliciousMenuItem = {
        id: 1, 
        name: 'Sausage, Eggs, Biscuit, & <script>alert("xss");</script>', 
        image_url:"https://insecure-website.com/status?message=<script>alert('xss');</script>",
        calories: 750,
        carbs: 53, 
        protein: 25,
        fat: 49,  
        category: "Breakfast"
    }

    const expectedMenuItem = {
        ...maliciousMenuItem,
        name: 'Sausage, Eggs, Biscuit, & &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        image_url: "https://insecure-website.com/status?message=&lt;script&gt;alert('xss');&lt;/script&gt;"
    }

    return {
        maliciousMenuItem,
        expectedMenuItem
    }

}


module.exports = {
    createMenu, makeMaliciousMenuItem
}

