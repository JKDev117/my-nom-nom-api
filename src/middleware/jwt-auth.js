const AuthService = require('../auth/auth-service')
const logger = require('../logger')

function requireAuth(req, res, next) {
    //verify that the request header includes authorization credentials & get the bearer token
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        logger.error('Missing bearer token @jwt-auth.js')
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        //verify the bearer token
        const payload = AuthService.verifyJwt(bearerToken)

        //verify that the user exists in the database
        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub
        )
            .then(user => {
                if (!user){
                    logger.error('@jwt-auth.js: Unauthorized request because user is undefined')
                    return res.status(401).json({ error: 'Unauthorized request' })
                }    
                req.user = user
                next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })
    } catch(error) {
        logger.error('@jwt-auth.js: Unauthorized request because code in try block failed')
        res.status(401).json({ error: 'Unauthorized request' })
    }
}

module.exports = {
    requireAuth
}



