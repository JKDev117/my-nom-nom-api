const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Auth Endpoints', function() {
  let db

  const testUsers = helpers.makeUsers()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
    helpers.cleanTables(db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /auth/login`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    const requiredFields = ['user_name', 'password']
    
    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      }
    
      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field]
    
        return supertest(app)
          .post('/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })

    it(`responds 400 'invalid user_name or password' when bad user_name`, () => {
        const userInvalidUser = { user_name: 'user-not', password: testUser.password }
        return supertest(app)
            .post('/auth/login')
            .send(userInvalidUser)
            .expect(400, { error: `Incorrect user_name or password` })
    })

    it(`responds 400 'invalid user_name or password' when bad password`, () => {
          const userInvalidPass = { user_name: testUser.user_name, password: 'incorrect' }
          return supertest(app)
            .post('/auth/login')
            .send(userInvalidPass)
            .expect(400, { error: `Incorrect user_name or password` })
    })

    it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
          const userValidCreds = {
            user_name: testUser.user_name,
            password: testUser.password,
          }
          return supertest(app)
            .post('/auth/login')
            .send(userValidCreds)
            .expect(200)
            .expect(res => expect(res.body).to.have.property('authToken'))
    })
  })//end describe 'POST /auth/login'

  describe(`POST /auth/refresh`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )
    it(`responds 200 and JWT auth token using secret`, () => {
      return supertest(app)
        .post('/auth/refresh')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => expect(res.body).to.have.property('authToken'))
    })
  })//end describe `POST /auth/refresh`

})//end describe 'Auth Endpoints'

