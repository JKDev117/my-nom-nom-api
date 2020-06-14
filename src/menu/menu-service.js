const MenuService = {
    getAllMenuItems(knex) {
        return knex.select('*').from('menu_tb')
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
    getById(knex, id){
        return knex
            .from('menu_tb')
            .select('*')
            .where('id', id)
            .first()
    }



}


module.exports = MenuService


