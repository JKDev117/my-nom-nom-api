const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')
const { json } = require('express')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')


describe('Plan Endpoints', function(){

    let db

    const {
        testUsers,
        testItems,
        testPlanItem,
    } = helpers.makeItemsFixtures()


    //let token;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    //afterEach('cleanup', () => helpers.cleanTables(db))
    
    
    //describe 'POST /plan'
    describe('POST /plan', () => {
    
        beforeEach('insert menu items', () => { 
            helpers.seedTables(
                db, 
                testUsers, 
                testItems
            )
        })
        
        it('creates a plan item, responding with 201 and the new plan item', function() {
            //this.retries(3)

            const testUser = testUsers[0] //e.g. Dunder Mifflin
            const testItem = testItems[0] 

            console.log('testItem being sent in POST /plan', testItem)
            console.log('testUser in POST /plan', testUser)

            return supertest(app)
                .post('/plan')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(testItem)
                .expect(201)
                .expect(res => {
                    //console.log('res @plan-endpoints.spec.js @POST /plan @201 test', res)
                    expect(res.body).to.have.property('user_id')
                    expect(res.body).to.have.property('menu_item_id')
                    expect(res.body.name).to.eql(testItem.name)
                    expect(res.body.user_id).to.eql(testUser.id)
                    expect(res.body.menu_item_id).to.eql(testItem.id)
                    expect(res.body.category).to.eql(testItem.category)
                })
                .then(res =>
                    // removed
                    //supertest(app)
                      //  .get(`/menu/${postRes.body.id}`)
                        //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                       // .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                       // .expect(postRes.body)
                    //
                    //added next 10 lines
                    db
                        .from('plan_tb')
                        .select('*')
                        .where({menu_item_id: res.body.menu_item_id})
                        .first()
                        .then(row => {
                            expect(row.name).to.eql(testItem.name)
                            expect(row.user_id).to.eql(testUser.id)
                            expect(row.menu_item_id).to.eql(testItem.id)
                            expect(row.category).to.eql(testItem.category)
                        }) 
                )
        })//end it 'creates a plan item, responding with 201 and the new plan item'
        /*
        const requiredFields = ['name', 'category']

        requiredFields.forEach(field => {
            const newMenuItem = {
                name: 'New Menu Item',
                category: 'Breakfast'
            }

            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newMenuItem[field]

                return supertest(app)
                    .post('/menu')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newMenuItem)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
        
        it('removes XSS attack content from response', () => {
            const testUser = helpers.makeUsers()[0]
            const {
                maliciousMenuItem,
                expectedMenuItem
            } = helpers.makeMaliciousMenuItem(testUser)

            return supertest(app)
                .post('/menu')
                //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(maliciousMenuItem)
                .expect(201)
                .expect(response => {
                    //expect(response.body.name).to.eql(expectedMenuItem.name)
                    expect(response.body.image_url).to.eql(expectedMenuItem.image_url)
                })
        })
        */
    })//end describe 'POST /plan'

    //describe 'GET /menu'
    describe('GET /plan', () => {


        context('Given no plan items', () => {
            //console.log(`overview of this test for GET /plan >> given there no plan items in the db:
            //seedTables@test-helpers.js -> makeAuthHeader@test-helpers.js -> requireAuth@jwt-auth.js -> get@plan.router`)

            //beforeEach(() => db.into('users_tb').insert(testUsers))
            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/plan')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
                }
            )
        })//End context 'Given no plan items'
        
        context('Given there are meal plan items in the database', () => {
            //console.log(`overview of this test for GET /plan >> given there are meal plan items in the db:
            //seedTables@test-helpers.js -> makeAuthHeader@test-helpers.js -> requireAuth@jwt-auth.js -> get@plan.router`)

            //new variable
            let token;

            //console.log('testPlanItem', testPlanItem)
            beforeEach('insert meal plan items', () => {
                helpers.seedTables(db, testUsers, testItems, testPlanItem)   
                /*    
                testUser = {
                    user_name: testUsers[0].user_name,
                    password: bcrypt.hashSync(testUsers[0].password, 12)
                }
                
                console.log("test user_name being sent to post /auth/login: ", testUser.user_name)
                console.log("test password being sent to post /auth/login: ", testUser.password)
                
                
                //try supertest here
                supertest(app)
                    .post('/auth/login')
                    .send({
                        user_name: testUser.user_name,
                        password: testUser.password
                    })
                    .end((err, res) => {
                        console.log('res.body after sending user_name and pw to post /auth/login', res.body)
                        token = res.body.token; //save the token
                    })
                */    
                    
            })
            

            it.only('GET /plan responds with 200 and all of the meal plan items', () => {
                
                return supertest(app)
                    .get('/plan')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    /* Notes: 
                        function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
                            const token = jwt.sign({ user_id: user.id }, secret, {
                                subject: user.user_name,
                                algorithm: 'HS256',
                                })
                                console.log('token', token)    
                                return `Bearer ${token}`
                        }
                        
                        testUsers[0]
                            {
                                id: 1,
                                first_name: 'Dunder',
                                last_name: 'Mifflin',
                                user_name: 'dunder_mifflin',
                                password: 'password',
                                date_created: '2029-01-22T16:28:32.615Z',
                            },


                    */
                    .expect(200, testPlanItem)
            })
            
        }) //end context 'Given there are menu items in the database'

    /*
    context('Given an XSS attack menu item', () => {
        const testUser = helpers.makeUsers()[0]
        const {
            maliciousMenuItem,
            expectedMenuItem
        } = helpers.makeMaliciousMenuItem(testUser)

        beforeEach('insert malicious menu item', () => 
            helpers.seedMaliciousItem(db, testUser, maliciousMenuItem)    
        )
        
        it('removes XSS attack content', () => {
            return supertest(app)
                .get('/menu')
                //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200)
                .expect(res => {
                    expect(res.body[0].name).to.eql(expectedMenuItem.name)
                    expect(res.body[0].image_url).to.eql(expectedMenuItem.image_url)
                })
        })
    })//end context 'Given an XSS attack menu item'
    */
})//end describe 'GET /menu'  
    /*
    //describe 'GET /menu/:item_id'
    describe('GET /menu/:item_id', () => {
        context('Given no menu items', () => {
            //beforeEach(() => db.into('users_tb').insert(testUsers))
            beforeEach(() => helpers.seedUsers(db, testUsers))

            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .get(`/menu/${itemId}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            //const testMenuItems =  createMenu()

            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )


            it('responds with 200 and the specified menu item', () => {
                const itemId = 1
                const expectedMenuItem = testItems[itemId - 1]
                return supertest(app)
                    .get(`/menu/${itemId}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedMenuItem)
            })
        })//end context 'Given there are menu items in the database'

    })//end describe 'GET /menu/:item_id'

    describe(`DELETE /menu/:item_id`, () => {
        context('Given no menu items', () => {
            //beforeEach(() => db.into('users_tb').insert(testUsers))
            beforeEach(() => helpers.seedUsers(db, testUsers))


            it(`responds with 404`, () => {
                const itemId = 123456
                return supertest(app)
                    .delete(`/menu/${itemId}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            //const testMenuItems = createMenu()
            
            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('responds with 204 and removes the menu item', () => {
                const idToRemove = 1
                const expectedMenuItems = testItems.filter(item => item.id !== idToRemove)
                return supertest(app)
                    .delete(`/menu/${idToRemove}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu`)
                            //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedMenuItems)
                    )
            })

        })//end context 'Given there are menu items in the database'
    }) //end describe 'DELETE /menu/:item_id'

    describe(`PATCH /menu/:item_id`, () => {
        context('Given no menu items', () => {
            //beforeEach(() => db.into('users_tb').insert(testUsers))
            beforeEach(() => helpers.seedUsers(db, testUsers))

            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .patch(`/menu/${itemId}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: {message: 'Menu item does not exist.'}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            //const testMenuItems = createMenu()

            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('responds with 204 and updates the menu item', () => {
                const idToUpdate = 1
                const updatedMenuItem = {
                    ...testItems[idToUpdate - 1],
                    name: "Updated Menu Item Name"
                }
                const expectedMenuItem = {
                    ...updatedMenuItem
                }
                return supertest(app)
                    .patch(`/menu/${idToUpdate}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updatedMenuItem)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu/${idToUpdate}`)
                            //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedMenuItem)
                    )
            })
        })//end context 'Given there are menu items in the database'

    }) //end describe 'PATCH /menu/:item_id'
*/

})//end describe 'Menu Endpoints'


