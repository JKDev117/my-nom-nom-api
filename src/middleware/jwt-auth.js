const AuthService = require('../auth/auth-service')
const logger = require('../logger')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    //console.log
    //console.log('contents of request headers/rawHeaders at requireAuth(jwt-auth.js)', req.headers, req.rawHeaders)


    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        //logger.error
        logger.error('Missing bearer token @jwt-auth.js')
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        //console.log('payload@jwt-auth.js', payload) //=>  (e.g.) { user_id: 1, iat: 1593839142, sub: 'dunder_mifflin' }
        //console.log('payload.sub@jwt-auth.js', payload.sub) //=>  (e.g.) 'dunder_mifflin'

        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub
            /*  Note:
                getUserWithUserName(db, user_name){
                    return db('users_tb')
                        .where({user_name})
                        .first()
                },
            */
        )
            .then(user => {
                console.log('@jwt-auth.js: user returned from getUserWithUserName() =>', user)
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
    requireAuth,
}



