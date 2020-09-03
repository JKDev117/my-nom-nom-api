const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');
const supertest = require('supertest');

describe('Plan Endpoints', function(){

    let db;

    const {
        testUsers,
        testItems,
        testPlanItem,
    } = helpers.makeItemsFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));
    
    
    //describe 'POST /plan'
    describe('POST /plan', () => {
    
        beforeEach('insert menu items', () => { 
            return helpers.seedTables(db, testUsers, testItems);
        });
        
        it('creates a plan item, responding with 201 and the new plan item', function() {
            const testUser = testUsers[0]; //e.g. Dunder Mifflin
            const testItem = testItems[0];

            return supertest(app)
                .post('/plan')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(testItem)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('user_id');
                    expect(res.body).to.have.property('menu_item_id');
                    expect(res.body.user_id).to.eql(testUser.id);
                    expect(res.body.menu_item_id).to.eql(testItem.id);
                })
                .then(res =>
                    db
                        .from('plan_tb')
                        .select('*')
                        .where({ id: res.body.id })
                        .then(row => {                            
                            expect(row[0].user_id).to.eql(testUser.id);
                            expect(row[0].menu_item_id).to.eql(testItem.id);
                        })
                );
        });//end it 'creates a plan item, responding with 201 and the new plan item'
    });//end describe 'POST /plan'

    //describe 'GET /menu'
    describe('GET /plan', () => {

        context('Given no plan items', () => {
            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            );

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/plan')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
                }
            );
        });//End context 'Given no plan items'
        
        context('Given there are meal plan items in the database', () => {
            beforeEach('insert meal plan items', () => {
                return helpers.seedTables(db, testUsers, testItems, testPlanItem)
            });

            const customReturnPlanItem = [{
                ...testPlanItem[0],
                name: testItems[0].name,
                image_url: testItems[0].image_url,
                calories: testItems[0].calories,
                carbs: testItems[0].carbs,
                protein: testItems[0].protein,
                fat: testItems[0].fat,
                category: testItems[0].category,
            }];
                
            it('GET /plan responds with 200 and all of the meal plan items', () => {                    
                return supertest(app)
                        .get('/plan')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, customReturnPlanItem);
            }) ;
        });//end context 'Given there are menu items in the database'
    });//end describe 'GET /menu'  
    
    //describe 'DELETE /menu'
    describe('DELETE /plan', () => {
        
        context('Given no plan items', () => {
            
            before('insert user', () => 
                helpers.seedUsers(db, testUsers)
            );

            it('responds with 404', () => {
                return supertest(app)
                    .delete('/plan')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(testPlanItem[0])
                    .expect(404, {error: {message: "Plan item doesn't exist!"}});
            });
        });//end context 'Given no plan items'

        context('Given there are meal plan items in the database', () => {

            before('insert meal plan items', () => {
                return helpers.seedTables(db, testUsers, testItems, testPlanItem);
            })
                
            it('DELETE /plan responds with 204 No Content', () => {                    
                return supertest(app)
                        .delete('/plan')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(testPlanItem[0])
                        .expect(204);
            });
        }); //end context 'Given there are menu items in the database'

    });//end describe 'DELETE /plan'
    
});//end describe 'Menu Endpoints'


