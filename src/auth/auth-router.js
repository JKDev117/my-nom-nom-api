const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')
const logger = require('../logger')
const authRouter = express.Router()
const jsonBodyParser = express.json()


authRouter
   .post('/auth/login', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body
        const loginUser = { user_name, password }

        //console.log('user_name @post /auth/login @auth-router.js', user_name)
        //console.log('password @post /auth/login @auth-router.js', password)

        for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            })
        //console.log('loginUser.user_name @auth-router.js', loginUser.user_name)
        AuthService.getUserWithUserName(
              req.app.get('db'),
              loginUser.user_name
            )
              .then(dbUser => {
                //console.log('dbUser @auth-router.js', dbUser)
                if (!dbUser){
                  logger.error('Incorrect user_name')
                  return res.status(400).json({
                    error: 'Incorrect user_name or password',
                  })
                }    
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch){
                            logger.error('Incorrect password')
                            return res.status(400).json({
                                error: 'Incorrect user_name or password',
                            })
                        }
                        const sub = dbUser.user_name
                        const payload = { user_id: dbUser.id }
                            res.send({
                                authToken: AuthService.createJwt(sub, payload),
                            })
                    })
              })
              .catch(next)
  })

authRouter
  .post('/auth/refresh', requireAuth, (req, res) => {
    const sub = req.user.user_name
    const payload = { user_id: req.user.id }
    res.send({
      authToken: AuthService.createJwt(sub, payload),
    })
})
  
module.exports = authRouter


