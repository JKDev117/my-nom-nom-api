const express = require('express')
const menuRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')
const MenuService = require('./menu-service')


const serializeMenuItem = item => ({
    id: item.id,
    name: xss(item.name),
    image_url: xss(item.image_url),
    calories: item.calories,
    carbs: item.carbs,
    protein: item.protein,
    fat: item.fat,
    category: item.category,
})


menuRouter
    .route('/menu')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        MenuService.getAllMenuItems(knexInstance)
            .then(items => {
                res.json(items.map(item => serializeMenuItem(item)))
            })
            .catch(next)
    })



module.exports = menuRouter