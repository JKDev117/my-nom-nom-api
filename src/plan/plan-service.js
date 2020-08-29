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
        return knex
            .select('*')
            .from('plan_tb')
            .where(
                { id: req_body.id, })
            .delete()
    }


} //end PlanService


module.exports = PlanService


