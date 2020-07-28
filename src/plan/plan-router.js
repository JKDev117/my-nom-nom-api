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
        //console.log('req.body', req.body)

        const { id, user_id } = req.body
        const newPlanItem = { user_id }

        newPlanItem.menu_item_id = id

        PlanService.addMenuItem(
            req.app.get('db'),
            newPlanItem
        )   
            .then(item => {
                //console.log('req.originalUrl', req.originalUrl) //=> /plan
                //console.log('item returned from db after PlanService.addMenuItem', item)
                res
                    .status(201)
                    //.location(path.posix.join(req.originalUrl, `/${item.id}`))
                    //.json(serializePlanItem(item))
                    .json(item)
            })
            .catch(next)
            /*
            .then(PlanService.getPlanItemsCount(req.app.get('db'))
                .then(items => {
                    res.json(items)
                })
                .catch(next)
            )*/
    })//end POST /plan
    //GET
    .get((req,res,next) => {
        //console.log('req.headers/authHeaders being sent in GET request', req.headers, req.authHeaders)
        //console.log('req.user at get /plan router', req.user) //=> { ... }
        const knexInstance = req.app.get('db')
        PlanService.getAllPlanItems(knexInstance, req.user.id)
            .then(items => {
                    //console.log('@plan-router.js: response or items being returned from getAllPlanItems() in GET => ', items)
                    res.json(items.rows)    
                })
            //.catch(next)         
            .catch(error => {
                console.log(error)
                next(error)
            })
    })
    //DELETE
    .delete(bodyParser, (req, res, next) => {
        console.log('req.body', req.body)
        console.log('req.body.id', req.body.id)
        console.log('req.body.user_id', req.body.user_id)

        
        PlanService.searchForPlanItem(
            req.app.get('db'),
            req.body
        )
            .then(result => {
                if(!result) {
                    logger.error("Plan item doesn't exist!")
                    return res.status(404).json({
                        error: {message: "Plan item doesn't exist!"}
                    })
                }
                //next()
            })
            .catch(err => console.log(err))
        

        PlanService.removePlanItem(
            req.app.get('db'),
            req.body
        )
            .then(() => 
                res.status(204).end()
            )
            .catch(next)
    })//end delete
    
    
/*
    .all((req,res,next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark doesn't exist!`)
                    return res.status(404).json({
                        error: {message: `Bookmark doesn't exist!`}
                    })
                }
                res.bookmark = bookmark //save the bookmark for the next middleware
                next() //don't forget to call next so the next middleware happens
            })
            .catch(next)
    })


*/


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