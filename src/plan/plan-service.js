const PlanService = {
    addMenuItem(knex, MenuItem){
        return knex
            .insert(MenuItem)
            .into('plan_tb')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getAllPlanItems(knex, user_id) {
        //console.log('user id @plan-service.js', user_id)
        return knex.select('*').from('plan_tb').where('user_id', user_id)
    },
    searchForPlanItem(knex, req_body){
        return knex
            .select('*')
            .from('plan_tb')
            .where(
                {
                    menu_item_id: req_body.id, 
                    user_id: req_body.user_id,
                    name: req_body.name,
                    image_url: req_body.image_url,
                    calories: req_body.calories,
                    carbs: req_body.carbs,
                    protein: req_body.protein,
                    fat: req_body.fat,
                    category: req_body.category
                })
            .first()
    },
    removePlanItem(knex, req_body){
        return knex
            .select('*')
            .from('plan_tb')
            .where(
                {
                    menu_item_id: req_body.id, 
                    user_id: req_body.user_id,
                    name: req_body.name,
                    image_url: req_body.image_url,
                    calories: req_body.calories,
                    carbs: req_body.carbs,
                    protein: req_body.protein,
                    fat: req_body.fat,
                    category: req_body.category
                })
            .first()
            .delete()
    }
    /*
    getById(knex, id, user_id){
        return knex
            .from('menu_tb')
            .select('*')
            .where({id: id, user_id: user_id})
            .first()
    },
    deleteMenuItem(knex, id, user_id) {
        return knex('menu_tb')
            .where({id: id, user_id: user_id})
            .delete()
    },
    updateMenuItem(knex, id, newMenuItemFields, user_id){
        return knex('menu_tb')
            .where({id: id, user_id: user_id})
            .update(newMenuItemFields)
    }*/


} //end PlanService


module.exports = PlanService


