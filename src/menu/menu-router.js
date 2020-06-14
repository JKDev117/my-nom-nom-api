const path = require('path')
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
    //GET
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        MenuService.getAllMenuItems(knexInstance)
            .then(items => {
                res.json(items.map(item => serializeMenuItem(item)))
            })
            .catch(next)
    })
    //POST
    .post(bodyParser, (req, res, next) => {
        const { name, category } = req.body
        const newMenuItem = { name, category }

        for(const [key, value] of Object.entries(newMenuItem)){
            if(value==null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}})
            }
        }

        newMenuItem.name = name

        MenuService.addMenuItem(
            req.app.get('db'),
            newMenuItem
        )
            .then(item => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${item.id}`))
                    .json(serializeMenuItem(item))
            })
            .catch(next)
    })



module.exports = menuRouter