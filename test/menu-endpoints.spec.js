const knex = require('knex')
const app = require('../src/app')
const { createMenu, makeMaliciousMenuItem } = require('./menu.fixtures')
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
        })

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
                        expect(res.body[0].url).to.eql(expectedMenuItem.url)
                    })
            })
        })

            


    

    })//end describe 'GET /menu'



})//end describe 'Menu Endpoints'


