const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')

const {
    testUsers,
    testItems,
} = helpers.makeItemsFixtures()

describe('Menu Endpoints', function(){

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
    describe('GET /menu', () => {
        context('Given no menu items', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers))

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/menu')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })//End context 'Given no menu items'

        context('Given there are menu items in the database', () => {

            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('GET /menu responds with 200 and all of the menu items', () => {
                return supertest(app)
                    .get('/menu')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, testItems)
            })
        }) //end context 'Given there are menu items in the database'

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
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedMenuItem.name)
                        expect(res.body[0].image_url).to.eql(expectedMenuItem.image_url)
                    })
            })
        })//end context 'Given an XSS attack menu item'
    })//end describe 'GET /menu'  

    
    //describe 'POST /menu'
    describe('POST /menu', () => {

        beforeEach(() => helpers.seedUsers(db, testUsers))

        it('creates a menu item, responding with 201 and the new menu item', function() {
            const testUser = testUsers[0]
            const newMenuItem = {
                name: "New Menu Item",
                category: "Breakfast"
            }
            return supertest(app)
                .post('/menu')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newMenuItem)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(newMenuItem.name)
                    expect(res.body.user_id).to.eql(testUser.id) //added
                    expect(res.body.category).to.eql(newMenuItem.category)
                    expect(res.headers.location).to.eql(`/menu/${res.body.id}`)//added
                })
                .then(postRes =>
                    db
                        .from('menu_tb')
                        .select('*')
                        .where({id: postRes.body.id})
                        .first()
                        .then(row => {
                            expect(row.name).to.eql(newMenuItem.name)
                            expect(row.category).to.eql(newMenuItem.category)
                            expect(row.user_id).to.eql(testUser.id)
                        })
                )
        })

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
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(maliciousMenuItem)
                .expect(201)
                .expect(response => {
                    expect(response.body.name).to.eql(expectedMenuItem.name)
                    expect(response.body.image_url).to.eql(expectedMenuItem.image_url)
                })
        })
    })//end describe 'POST /menu'


    //describe 'GET /menu/:item_id'
    describe('GET /menu/:item_id', () => {
        context('Given no menu items', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers))

            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .get(`/menu/${itemId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {

            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )

            it('responds with 200 and the specified menu item', () => {
                const itemId = 1
                const expectedMenuItem = testItems[itemId - 1]
                return supertest(app)
                    .get(`/menu/${itemId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedMenuItem)
            })
        })//end context 'Given there are menu items in the database'

    })//end describe 'GET /menu/:item_id'

    describe(`DELETE /menu/:item_id`, () => {
        context('Given no menu items', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers))
            it(`responds with 404`, () => {
                const itemId = 123456
                return supertest(app)
                    .delete(`/menu/${itemId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            beforeEach('insert menu items', () => 
                helpers.seedTables(db, testUsers, testItems)
            )
            it('responds with 204 and removes the menu item', () => {
                const idToRemove = 1
                const expectedMenuItems = testItems.filter(item => item.id !== idToRemove)
                return supertest(app)
                    .delete(`/menu/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedMenuItems)
                    )
            })
        })//end context 'Given there are menu items in the database'
    }) //end describe 'DELETE /menu/:item_id'


    describe(`PATCH /menu/:item_id`, () => {
        context('Given no menu items', () => {
            beforeEach(() => helpers.seedUsers(db, testUsers))

            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .patch(`/menu/${itemId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: {message: 'Menu item does not exist.'}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {

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
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updatedMenuItem)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedMenuItem)
                    )
            })
        })//end context 'Given there are menu items in the database'

    }) //end describe 'PATCH /menu/:item_id'

})//end describe 'Menu Endpoints'


