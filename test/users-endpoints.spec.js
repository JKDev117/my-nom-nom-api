const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function() {
  let db

  const testUsers = helpers.makeUsers()
  //console.log(testUsers)
  const testUser = testUsers[0]

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
        it(`responds 400 'Password must be longer than 8 characters' when password is less than 8 chars`, () => {
            const userShortPassword = {
              first_name: 'test first_name',
              last_name: 'test last_name',
              user_name: 'test user_name',
              password: '1234567',
            }
            return supertest(app)
              .post('/users')
              .send(userShortPassword)
              .expect(400, { error: `Password must be longer than 8 characters` })
        })
        it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
            const userLongPassword = {
              first_name: 'test first_name',
              last_name: 'test last_name',
              user_name: 'test user_name',
              password: '*'.repeat(73),
            }
             //console.log(userLongPassword)
             //console.log(userLongPassword.password.length)
             console.log("userLongPassword.password", userLongPassword.password)
            return supertest(app)
              .post('/users')
              .send(userLongPassword)
              .expect(400, { error: `Password must be less than 72 characters` })
        })
        it(`responds 400 error when password starts with spaces`, () => {
            const userPasswordStartsSpaces = {
              first_name: 'test first_name',
              last_name: 'test last_name',
              user_name: 'test user_name',
              password: ' 1Aa!2Bb@',
            }
            return supertest(app)
              .post('/users')
              .send(userPasswordStartsSpaces)
              .expect(400, { error: `Password must not start or end with empty spaces` })
        })
        it(`responds 400 error when password ends with spaces`, () => {
           const userPasswordEndsSpaces = {
              first_name: 'test first_name',
              last_name: 'test last_name',
              user_name: 'test user_name', 
              password: '1Aa!2Bb@ ',
           }
           return supertest(app)
              .post('/users')
              .send(userPasswordEndsSpaces)
              .expect(400, { error: `Password must not start or end with empty spaces` })
        })
        it(`responds 400 error when password isn't complex enough`, () => {
           const userPasswordNotComplex = {
              first_name: 'test first_name',
              last_name: 'test last_name',
              user_name: 'test user_name',
              password: '11AAaabb',
           }
           return supertest(app)
              .post('/users')
              .send(userPasswordNotComplex)
              .expect(400, { error: `Password must contain 1 upper case, lower case, number and special character` })
         })
         
         it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
           const duplicateUser = {
              first_name: 'test first_name',
              last_name: 'test last_name', 
              user_name: testUser.user_name,
              password: '11AAaa!!',
           }
           return supertest(app)
              .post('/users')
              .send(duplicateUser)
              .expect(400, { error: `Username already taken` })
         })


      })
    })
  })
})