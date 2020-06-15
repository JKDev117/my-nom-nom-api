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
        const { name, image_url, category } = req.body
        const newMenuItem = { name, image_url, category }

        if(newMenuItem.name == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'name' in request body`}})
        }

        if(newMenuItem.category == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'category' in request body`}})
        }

        /*
        for(const [key, value] of Object.entries(newMenuItem)){
            if(value==null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}})
            }
        }
        */

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
    
    
menuRouter
    .route('/menu/:item_id')
    //ALL
    .all((req, res, next) => {
        MenuService.getById(
            req.app.get('db'),
            req.params.item_id
        )
        .then(item => {
            if(!item){
                return res.status(404).json({
                    error: {message: `Menu item does not exist.`}
                })
            }
            res.item = item
            next()
        })
        .catch(next)
    })
    //GET
    .get((req, res, next) => 
        res.json(serializeMenuItem(res.item)) 
    )
    //DELETE
    .delete((req, res, next) => {
        //console.log(req.params)
        MenuService.deleteMenuItem(
            req.app.get('db'),
            req.params.item_id
        )
        
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    //PATCH
    .patch(bodyParser, (req, res, next) => {
        const { name, image_url, calories, carbs, protein, fat, category } = req.body
        const itemToUpdate = { name, image_url, calories, carbs, protein, fat, category }

        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length

        if(numberOfValues === 0){
            //logger.error(`Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', or 'category'`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', or 'category'`
                }
            })
        }

        //conditions that must be met for integers goes here ....


        if(image_url!=undefined && !isWebUri(image_url)){
            //logger.error(`url must be a valid URL`)
            return res
                .status(400)
                .json({
                    error: { message: `url must be a valid URL`}
                })
        }

        MenuService.updateMenuItem(
            req.app.get('db'),
            req.params.item_id,
            itemToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = menuRouter