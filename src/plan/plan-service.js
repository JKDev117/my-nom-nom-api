const PlanService = {
    addMenuItem(knex, MenuItem){
        return knex
            .insert(MenuItem)
            .into('plan_tb')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },/*
    getPlanItemsCount(knex){
        return knex
            .from('plan_tb')
            .select('menu_item_id')
            .count('*')
            .groupBy('menu_item_id')
    },*/
    getAllPlanItems(knex, user_id) {
        //console.log('user id @plan-service.js', user_id)
        //return knex.select('*').from('plan_tb').where('user_id', user_id)
        return knex.raw(
            `SELECT
                p.id,
                p.menu_item_id,
                p.user_id,
                m.name,
                m.image_url,
                m.calories,
                m.carbs,
                m.protein,
                m.fat,
                m.category
            FROM plan_tb p
            JOIN menu_tb m
            ON p.menu_item_id = m.id`)
    },
    searchForPlanItem(knex, req_body){
        return knex
            .select('*')
            .from('plan_tb')
            .where(
                { id: req_body.id, })
            .first()
    },
    removePlanItem(knex, req_body){
        //console.log('req_body.menu_item_idy @plan-service.js @removePlanItem', req_body.menu_item_id)
        //console.log('req_body @plan-service.js @removePlanItem', req_body)
        return knex
            .select('*')
            .from('plan_tb')
            .where(
                { id: req_body.id, })
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


