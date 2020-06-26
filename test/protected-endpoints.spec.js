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
    before('cleanup', () => db.raw(`TRUNCATE menu_tb, users_tb RESTART IDENTITY CASCADE`))

    //afterEach('cleanup', () => db('menu_tb').truncate())
    afterEach('cleanup', () => db.raw(`TRUNCATE menu_tb, users_tb RESTART IDENTITY CASCADE`))


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
              .expect(401, { error: `Missing basic token` })
          })
          it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { user_name: '', password: '' }
                return endpoint.method(endpoint.path)
                  .set('Authorization', helpers.makeAuthHeader(userNoCreds))
                  .expect(401, { error: `Unauthorized request` })
          })
          it(`responds 401 'Unauthorized request' when invalid user`, () => {
                 const userInvalidCreds = { user_name: 'nonexistent-username', password: 'password' }
                 return endpoint.method(endpoint.path)
                   .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
                   .expect(401, { error: `Unauthorized request` })
          })
          it(`responds 401 'Unauthorized request' when invalid password`, () => {
                const userInvalidPass = { user_name: testUsers[0].user_name, password: 'wrong-password' }
                return endpoint.method(endpoint.path)
                  .set('Authorization', helpers.makeAuthHeader(userInvalidPass))
                  .expect(401, { error: `Unauthorized request` })
          })  
      })
    })

})//end describe 'Protected endpoints'

