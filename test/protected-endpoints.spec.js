const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe(`Protected endpoints`, () => {
    
    let db

    const {
        testUsers,
        testItems,
    } = helpers.makeItemsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    //before('clean the table', () => db('menu_tb').truncate())
    before('cleanup', () => helpers.cleanTables(db))

    //afterEach('cleanup', () => db('menu_tb').truncate())
    afterEach('cleanup', () => helpers.cleanTables(db))


    beforeEach('insert menu items', () =>
      helpers.seedTables(db, testUsers, testItems)
    )

    const protectedEndpoints = [
        {
          name: 'GET /menu',
          path: '/menu',
          method: supertest(app).get,
        },
        {
          name: 'POST /menu',
          path: '/menu',
          method: supertest(app).post,  
          },
        {
          name: 'GET /menu/:item_id',
          path: '/menu/1',
          method: supertest(app).get,
        },
        {
          name: 'PATCH /menu/:item_id',
          path: '/menu/1',
          method: supertest(app).patch,  
        },
        {
          name: 'DELETE /menu/:item_id',
          path: '/menu/1',
          method: supertest(app).delete,  
        }
    ]
  
    protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
          it(`responds with 401 'Missing basic token' when no basic token`, () => {
            return endpoint.method(endpoint.path)
              .expect(401, { error: `Missing bearer token` })
          })
          it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0]
                const invalidSecret = 'bad-secret'
                return endpoint.method(endpoint.path)
                  .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                  .expect(401, { error: `Unauthorized request` })
          })
          it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                 const invalidUser = { user_name: 'user-not-existy', id: 1 }
                 return endpoint.method(endpoint.path)
                   .set('Authorization', helpers.makeAuthHeader(invalidUser))
                   .expect(401, { error: `Unauthorized request` })
          }) 
      })
    })

})//end describe 'Protected endpoints'

