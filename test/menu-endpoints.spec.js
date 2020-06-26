const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')

//const { makeUsers, createMenu, makeMaliciousMenuItem, helpers.makeAuthHeader } = require('./menu.fixtures')
//const testUsers = makeUsers()
//const menuItems = createMenu(testUsers);

const helpers = require('./menu.fixtures')

const {
    testUsers,
    testItems,
} = helpers.makeItemsFixtures()



describe('Menu Endpoints', function(){

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    //before('clean the table', () => db('menu_tb').truncate())
    before('cleanup', () => db.raw(`TRUNCATE menu_tb, users_tb RESTART IDENTITY CASCADE`))

    //afterEach('cleanup', () => db('menu_tb').truncate())
    afterEach('cleanup', () => db.raw(`TRUNCATE menu_tb, users_tb RESTART IDENTITY CASCADE`))


    describe.only(`Protected endpoints`, () => {
          beforeEach('insert menu items', () =>
            helpers.seedTables(db, testUsers, testItems)
          )
        
          describe(`GET /menu/:item_id`, () => {
            it(`responds with 401 'Missing basic token' when no basic token`, () => {
              return supertest(app)
                .get(`/menu/1`)
                .expect(401, { error: `Missing basic token` })
            })
          })
    })


    //describe 'GET /menu'
    describe('GET /menu', () => {
        context('Given no menu items', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/menu')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
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
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
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
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
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

        it('creates a menu item, responding with 201 and the new menu item', function() {
            const newMenuItem = {
                name: "New Menu Item",
                category: "Breakfast"
            }

            return supertest(app)
                .post('/menu')
                .send(newMenuItem)
                //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(newMenuItem.name)
                    expect(res.body.category).to.eql(newMenuItem.category)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/menu/${postRes.body.id}`)
                        //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(postRes.body)
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
                    .send(newMenuItem)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
        
        it('removes XSS attack content from response', () => {
            const {
                maliciousMenuItem,
                expectedMenuItem
            } = helpers.makeMaliciousMenuItem(testUser)

            return supertest(app)
                .post('/menu')
                .send(maliciousMenuItem)
                //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(201)
                .expect(response => {
                    //expect(response.body.name).to.eql(expectedMenuItem.name)
                    expect(response.body.image_url).to.eql(expectedMenuItem.image_url)
                })
        })
    })//end describe 'POST /menu'



    //describe 'GET /menu/:item_id'
    describe.only('GET /menu/:item_id', () => {
        context('Given no menu items', () => {
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
                    .send(updatedMenuItem)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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




})//end describe 'Menu Endpoints'


