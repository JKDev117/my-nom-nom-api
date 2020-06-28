const MenuService = {
    getAllMenuItems(knex, user_id) {
        return knex.select('*').from('menu_tb').where('user_id', user_id)
    },
    addMenuItem(knex, newMenuItem){
        return knex
            .insert(newMenuItem)
            .into('menu_tb')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
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
    }
}//end MenuService



module.exports = MenuService


