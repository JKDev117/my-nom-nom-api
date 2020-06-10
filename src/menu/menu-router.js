const express = require('express')
const menuRouter = express.Router()
const bodyParser = express.json()

const MenuService = require('./menu-service')



menuRouter
    .route('/menu')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        MenuService.getAllMenuItems(knexInstance)
            .then(items => res.json(items))
            .catch(next)
    })



module.exports = menuRouter