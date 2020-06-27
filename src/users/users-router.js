const express = require('express')
const UsersService = require('./users-service')
const usersRouter = express.Router()
const path = require('path')
const jsonBodyParser = express.json()

usersRouter
  .post('/users', jsonBodyParser, (req, res, next) => {
    const { first_name, last_name, user_name, password } = req.body

    for (const field of ['first_name', 'last_name', 'user_name', 'password'])
       
       if (!req.body[field])
         return res.status(400).json({
           error: `Missing '${field}' in request body`
         })
       if (password.length < 8) {
         return res.status(400).json({
           error: 'Password must be longer than 8 characters',
         })
       }
       const passwordError = UsersService.validatePassword(password)
       console.log('passwordError: ', passwordError)

       if (passwordError)
          return res.status(400).json({ error: passwordError })

       UsersService.hasUserWithUserName(
           req.app.get('db'),
           user_name
         )
           .then(hasUserWithUserName => {
             if (hasUserWithUserName)
               return res.status(400).json({ error: `Username already taken` })

               return UsersService.hashPassword(password)
                .then(hashedPassword => {
                  const newUser = {
                    first_name,
                    last_name,
                    user_name,
                    password: hashedPassword,
                    date_created: 'now()',
                  }
           
                  return UsersService.insertUser(
                    req.app.get('db'),
                    newUser
                  )
                    .then(user => {
                      res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                        .json(UsersService.serializeUser(user))
                    })
                }) 
             
           })
           .catch(next)     
  })//end post '/users'

module.exports = usersRouter