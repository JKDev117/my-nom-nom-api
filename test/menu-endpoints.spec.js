const knex = require('knex')
const app = require('../src/app')
const { createMenu, makeMaliciousMenuItem } = require('./menu.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')
const { maliciousMenuItem, expectedMenuItem } = makeMaliciousMenuItem()

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

    before('clean the table', () => db('menu_tb').truncate())

    afterEach('cleanup', () => db('menu_tb').truncate())

    //describe 'GET /menu'
    describe('GET /menu', () => {
        context('Given no menu items', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/menu')
                    .expect(200, [])
            })
        })//End context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            const menuItems = createMenu();

            beforeEach('insert menu items', () => {
                return db
                    .into('menu_tb')
                    .insert(menuItems)
            })

            it('GET /menu responds with 200 and all of the menu items', () => {
                return supertest(app)
                    .get('/menu')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, menuItems)
            })
        }) //end context 'Given there are menu items in the database'

        context('Given an XSS attack menu item', () => {
            beforeEach('insert malicious menu item', () => {
                return db
                    .into('menu_tb')
                    .insert([maliciousMenuItem])
            })
            
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/menu')
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
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
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(newMenuItem.name)
                    expect(res.body.category).to.eql(newMenuItem.category)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/menu/${postRes.body.id}`)
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
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
        
        it('removes XSS attack content from response', () => {
            return supertest(app)
                .post('/menu')
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
            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .get(`/menu/${itemId}`)
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            const testMenuItems =  createMenu()

            beforeEach('insert menu items', () => {
                return db
                    .into('menu_tb')
                    .insert(testMenuItems)
            })

            it('responds with 200 and the specified menu item', () => {
                const itemId = 1
                const expectedMenuItem = testMenuItems[itemId - 1]
                return supertest(app)
                    .get(`/menu/${itemId}`)
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
                    .expect(404, {error: {message: `Menu item does not exist.`}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            const testMenuItems = createMenu()
            
            beforeEach('insert menu items', () => {
                return db
                    .into('menu_tb')
                    .insert(testMenuItems)
            })

            it('responds with 204 and removes the menu item', () => {
                const idToRemove = 1
                const expectedMenuItems = testMenuItems.filter(item => item.id !== idToRemove)
                return supertest(app)
                    .delete(`/menu/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu`)
                            .expect(expectedMenuItems)
                    )
            })

        })//end context 'Given there are menu items in the database'
    }) //end describe 'DELETE /menu/:item_id'

    describe.only(`PATCH /menu/:item_id`, () => {
        context('Given no menu items', () => {
            it('responds with 404', () => {
                const itemId = 123456
                return supertest(app)
                    .patch(`/menu/${itemId}`)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: {message: 'Menu item does not exist.'}})
            })
        })//end context 'Given no menu items'

        context('Given there are menu items in the database', () => {
            const testMenuItems = createMenu()

            beforeEach('insert menu items', () => {
                return db
                    .into('menu_tb')
                    .insert(testMenuItems)
            })

            it('responds with 204 and updates the menu item', () => {
                const idToUpdate = 1
                const updatedMenuItem = {
                    name: "Updated Menu Item Name"
                }
                const expectedMenuItem = {
                    ...testMenuItems[idToUpdate - 1],
                    ...updatedMenuItem
                }
                return supertest(app)
                    .patch(`/menu/${idToUpdate}`)
                    .send(updatedMenuItem)
                    //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/menu/${idToUpdate}`)
                            //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedMenuItem)
                    )
            })



        })//end context 'Given there are menu items in the database'

    }) //end describe 'PATCH /menu/:item_id'




})//end describe 'Menu Endpoints'


