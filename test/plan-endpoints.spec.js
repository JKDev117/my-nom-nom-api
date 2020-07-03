const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')

const {
    testUsers,
    testItems,
    testPlanItem,
} = helpers.makeItemsFixtures()


describe.only('Plan Endpoints', function(){

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))
    
    //describe 'GET /menu'
    describe('GET /plan', () => {
        context('Given no plan items', () => {
            //beforeEach(() => db.into('users_tb').insert(testUsers))
            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('responds with 200 and an empty list', (done) => {
                return supertest(app)
                    //GET
                    .get('/plan')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    //.expect(200, [])
                    .expect(200, done())
                }
            )
        })//End context 'Given no plan items'
        
        context('Given there are meal plan items in the database', () => {

            beforeEach('insert meal plan items', () => {
                helpers.seedPlan(db, testUsers, testItems, testPlanItem) 
            })
        
            it('GET /menu responds with 200 and all of the meal plan items', (done) => {
                return supertest(app)
                    .get('/plan')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, testPlanItem, done())
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
    
    
    //describe 'POST /plan'
    describe('POST /plan', () => {
    
        beforeEach('insert menu items', () => { 
            helpers.seedTables(db, testUsers, testItems)
        }
        )

        it('creates a plan item, responding with 201 and the new plan item', function() {
            const testUser = testUsers[0]
            const testItem = testPlanItem[0]

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
                    expect(res.body.category).to.eql(testItem.category)
                })
                .then(postRes =>
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
                        .where({menu_item_id: postRes.body.menu_item_id})
                        .first()
                        .then(row => {
                            expect(row.name).to.eql(testItem.name)
                            expect(row.category).to.eql(testItem.category)
                            expect(row.menu_item_id).to.eql(testItem.id)
                            expect(row.user_id).to.eql(testUser.id)
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


