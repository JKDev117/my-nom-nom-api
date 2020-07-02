//app.js to export the app ready for integration testing

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const {v4:uuid} = require('uuid')
//const { CLIENT_ORIGIN } = require('./config')
const logger = require('./logger')
const menuRouter = require('./menu/menu-router')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const validateBearerToken = require('./validate-bearer-token')

const app = express()

const morganOption = (process.env.NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet()) //Make sure to place helmet before cors in the pipeline. 17.6
app.use(cors())
/*
app.use(cors({
    origin: CLIENT_ORIGIN
  }))
*/

//app.use(validateBearerToken);

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    logger.error(error.message)
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

app.use(menuRouter)
app.use(authRouter)
app.use(usersRouter)
//app.use(planRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})


module.exports = app