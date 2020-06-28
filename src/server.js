//server.js to start our server on an appropriate port
const knex = require('knex')
const app = require('./app')

const { PORT, DB_URL} = require('./config')

//knex instance
const db = knex({
  client: 'pg',
  connection: DB_URL
})


app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})


