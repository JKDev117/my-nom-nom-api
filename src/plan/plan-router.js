//const path = require('path')
const express = require('express')
const planRouter = express.Router()
const bodyParser = express.json()
const xss = require('xss')
const PlanService = require('./plan-service')
const validate = require('url-validator')
const logger = require('../logger')
//const { requireAuth } = require('../middleware/basic-auth')
const { requireAuth } = require('../middleware/jwt-auth')


const serializePlanItem = item => ({
    user_id: item.user_id,
    menu_item_id: item.menu_item_id,
    name: xss(item.name),
    image_url: xss(item.image_url),
    calories: item.calories,
    carbs: item.carbs,
    protein: item.protein,
    fat: item.fat,
    category: item.category,
})


planRouter
    .route('/plan')
    //ALL
    .all(requireAuth)
    //POST
    .post(bodyParser, (req, res, next) => {
  
        const { user_id, name, image_url, calories, carbs, protein, fat, category } = req.body
        const newPlanItem = { user_id, name, image_url, calories, carbs, protein, fat, category }
  
        if(newPlanItem.name == null){
            logger.error(`Missing 'name' in request body`)
            return res
                    .status(400)
                    .json({error: {message: `Missing 'name' in request body`}})
        }

        if(newPlanItem.category == null){
            logger.error(`Missing 'category' in request body`)
            return res
                    .status(400)
                    .json({error: {message: `Missing 'category' in request body`}})
        }
        
        const array = [calories, carbs, protein, fat]
                
        array.forEach(element => {
          if(element!=undefined && (!Number.isInteger(element) || element < 0)){
            logger.error(`Rating must be a number greater than zero`)
            return res
                .status(400)
                .json({
                    error: { message: `Rating must be a number greater than zero`}
                })
          }
        })
        
        if(image_url!=undefined && image_url.length > 0 && !validate(image_url)){
            logger.error(`url must be a valid URL`)
            return res
                .status(400)
                .json({
                    error: { message: `url must be a valid URL`}
                })
        }
        
        /*
        for(const [key, value] of Object.entries(newMenuItem)){
            if(value==null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}})
            }
        }
        
        newMenuItem.name = name
        */
    
        newPlanItem.menu_item_id = req.body.id

        PlanService.addMenuItem(
            req.app.get('db'),
            newPlanItem
        )
            .then(item => {
                //console.log('req.originalUrl', req.originalUrl) //=> /plan
                console.log('item returned from db after PlanService.addMenuItem', item)
                res
                    .status(201)
                    //.location(path.posix.join(req.originalUrl, `/${item.id}`))
                    .json(serializePlanItem(item))
            })
           .catch(next)
            
    })//end POST /plan
    //GET
    .get((req,res,next) => {
        //console.log('req.headers/authHeaders being sent in GET request', req.headers, req.authHeaders)
        //console.log('req.user at get /plan router', req.user) //=> { ... }
        const knexInstance = req.app.get('db')
        PlanService.getAllPlanItems(knexInstance, req.user.id)
            .then(items => {
                    console.log('response or items being returned from getAllPlanItems() in GET ', items)
                    res.json(items.map(item => serializePlanItem(item)))    
                })
            //.catch(next)         
            .catch(error => {
                console.log(error)
                next(error)
            })
    })
    
    
/*    
menuRouter
    .route('/menu/:item_id')
    //ALL
    .all(requireAuth)
    .all((req, res, next) => {
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
    //GET
    .get((req, res, next) => 
        res.json(serializeMenuItem(res.item)) 
    )
    //DELETE
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
    //PATCH
    .patch(bodyParser, (req, res, next) => {
        const { name, image_url, calories, carbs, protein, fat, category } = req.body
        const itemToUpdate = { name, image_url, calories, carbs, protein, fat, category }
        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length

        
        if(numberOfValues === 0){
            logger.error(`Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', or 'category'`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'image_url', 'calories', 'carbs', 'protein', 'fat', or 'category'`
                }
            })
        }
        
        if(itemToUpdate.name == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'name' in request body`}})
        }

        if(itemToUpdate.category == null){
            return res
                    .status(400)
                    .json({error: {message: `Missing 'category' in request body`}})
        }
        
        
        const array = [calories, carbs, protein, fat]
                
        array.forEach((element, i) => {
          if(element!=undefined && element!=null && element.length > 0 && (!Number.isInteger(element) || element < 0)){
            logger.error(`calories, carbs, protein, or fat category must be a NUMBER greater than zero`)
            return res
                .status(400)
                .json({
                    error: { message: `calories, carbs, protein, or fat category must be a NUMBER greater than zero`}
                })
          }
        })
                
        if(image_url!=undefined && image_url.length > 0  && !validate(image_url)){
            logger.error(`url must be a valid URL`)
            return res
                .status(400)
                .json({
                    error: { message: `url must be a valid URL`}
                })
        }
        

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

*/

module.exports = planRouter