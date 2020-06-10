const MenuService = {
    getAllMenuItems(knex) {
        return knex.select('*').from('menu_tb')
    },
}


module.exports = MenuService


