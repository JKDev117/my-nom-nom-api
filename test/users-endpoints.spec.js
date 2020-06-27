const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function() {
  let db

  const testUsers = helpers.makeUsers()
  //console.log(testUsers)

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /users`, () => {
    context(`User Validation`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers,
        )
      )

      const requiredFields = ['first_name', 'last_name', 'user_name', 'password']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          first_name: 'test first_name',
          last_name: 'test last_name',
          user_name: 'test user_name',
          password: 'test password',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })
    })
  })
})