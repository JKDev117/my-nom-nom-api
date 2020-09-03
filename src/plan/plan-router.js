const express = require('express');
const planRouter = express.Router();
const bodyParser = express.json();
const xss = require('xss');
const PlanService = require('./plan-service');
const logger = require('../logger');
const { requireAuth } = require('../middleware/jwt-auth');

planRouter
    .route('/plan')
    //ALL
    .all(requireAuth)
    //POST /plan
    .post(bodyParser, (req, res, next) => {

        const { id, user_id } = req.body;
        const newPlanItem = { user_id };

        newPlanItem.menu_item_id = id;
        
        PlanService.addMenuItem(
            req.app.get('db'),
            newPlanItem
        )   
            .then(item => {
                res
                    .status(201)
                    .json(item);
            })
            .catch(next);
    })
    //GET /plan
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        PlanService.getAllPlanItems(knexInstance)
            .then(items => {
                    res.json(items.rows);  
                })
            .catch(error => {
                console.log(error);
                next(error);
            })
    })
    //DELETE /plan
    .delete(bodyParser, (req, res, next) => {
        PlanService.searchForPlanItem(
            req.app.get('db'),
            req.body
        )
            .then(result => {
                if(!result) {
                    logger.error("Plan item doesn't exist!");
                    return res.status(404).json({
                        error: {message: "Plan item doesn't exist!"}
                    });
                };
            })
            .catch(err => console.log(err));
        
        PlanService.removePlanItem(
            req.app.get('db'),
            req.body
        )
            .then(() => 
                res.status(204).end()
            )
            .catch(next);
    });//end delete /plan
    
module.exports = planRouter;