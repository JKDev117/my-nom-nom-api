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
        console.log('user id @plan-service.js', user_id)
        return knex.select('*').from('plan_tb').where('user_id', user_id)
    },
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


