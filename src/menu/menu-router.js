const path = require('path')
const express = require('express')
const menuRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')
const MenuService = require('./menu-service')
const validate = require('url-validator')
const logger = require('../logger')
const { requireAuth } = require('../middleware/jwt-auth')

const serializeMenuItem = item => ({
    id: item.id,
    name: xss(item.name),
    user_id: item.user_id,
    image_url: xss(item.image_url),
    calories: item.calories,
    carbs: item.carbs,
    protein: item.protein,
    fat: item.fat,
    category: item.category,
})

menuRouter
    .route('/menu')
    //ALL
    .all(requireAuth)
    //GET /menu
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        MenuService.getAllMenuItems(knexInstance, req.user.id)
            .then(items => {
                res.json(items.map(item => serializeMenuItem(item)))
            })
            .catch(next)
    })
    //POST /menu
    .post(bodyParser, (req, res, next) => {
        const { name, image_url, calories, carbs, protein, fat, category } = req.body
        const newMenuItem = { name, image_url, calories, carbs, protein, fat, category }

        //if name of the menu item is missing
        if(newMenuItem.name == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'name' in request body`}})
        }

        //if a category is not selected
        if(newMenuItem.category == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'category' in request body`}})
        }

        //if the category selected is not a valid category
        if(['Breakfast', 'Lunch', 'Dinner'].includes(newMenuItem.category) == false){
            return res
                    .status(400)
                    .json({error: {message: `Category must be Breakfast, Lunch, or Dinner`}})
        }
        
        const array = [calories, carbs, protein, fat]
        
        //if calories, carbs, protein, and/or fat is provided by the user
        for(let element of array){
          if(element!=undefined){
                if(!Number.isInteger(element) || Number(element) < 0){
                    logger.error(`Calories, carbs, protein, or fat must be a number greater than zero`)
                    return res
                        .status(400)
                        .json({
                            error: { message: `Calories, carbs, protein, or fat must be a number greater than zero`}
                        })
                }
          }
        }
        
        //if an image url link is provided by the user
        if(image_url!=undefined && image_url.length > 0 && !validate(image_url)){
            logger.error(`url must be a valid URL`)
            return res
                .status(400)
                .json({
                    error: { message: `url must be a valid URL`}
                })
        }

        newMenuItem.user_id = req.user.id

        //add the menu item to menu_tb
        MenuService.addMenuItem(
            req.app.get('db'),
            newMenuItem
        )
            .then(item => 
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${item.id}`))
                    .json(serializeMenuItem(item))
            )
            .catch(next)      
    })
    
    
menuRouter
    .route('/menu/:item_id')
    //ALL
    .all(requireAuth, (req, res, next) => {
        MenuService.getById(
            req.app.get('db'),
            req.params.item_id,
            req.user.id
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
    //GET /menu/:item_id
    .get((req, res, next) => 
        res.json(serializeMenuItem(res.item)) 
    )
    //DELETE /menu/:item_id
    .delete((req, res, next) => {
        MenuService.deleteMenuItem(
            req.app.get('db'),
            req.params.item_id,
            req.user.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    //PATCH /menu/:item_id
    .patch(bodyParser, (req, res, next) => {
        const { name, image_url, calories, carbs, protein, fat, category } = req.body
        const itemToUpdate = { name, image_url, calories, carbs, protein, fat, category }
        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length

        if(numberOfValues === 0){
            logger.error(`Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', and/or 'category'`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', and/or 'category'`
                }
            })
        }

        //if name of the menu item is missing
        if(itemToUpdate.name == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'name' in request body`}})
        }

        //if a category is not selected
        if(itemToUpdate.category == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'category' in request body`}})
        }

        //if the category selected is not a valid category
        if(['Breakfast', 'Lunch', 'Dinner'].includes(itemToUpdate.category) == false){
            return res
                    .status(400)
                    .json({error: {message: `Category must be Breakfast, Lunch, or Dinner`}})
        }

        const array = [calories, carbs, protein, fat]
        
        //if calories, carbs, protein, and/or fat is provided by the user
        for(let element of array){
          if(element!=undefined){
                if(!Number.isInteger(element) || Number(element) < 0){
                    logger.error(`Calories, carbs, protein, or fat must be a number greater than zero`)
                    return res
                        .status(400)
                        .json({
                            error: { message: `Calories, carbs, protein, or fat must be a number greater than zero`}
                        })
                }
          }
        }

        //if an image url link is provided by the user        
        if(image_url!=undefined && image_url.length > 0  && !validate(image_url)){
            logger.error(`url must be a valid URL`)
            return res
                .status(400)
                .json({
                    error: { message: `url must be a valid URL`}
                })
        }

        //update the menu item information in menu_tb
        MenuService.updateMenuItem(
            req.app.get('db'),
            req.params.item_id,
            itemToUpdate,
            req.user.id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = menuRouter;