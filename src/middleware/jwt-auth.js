const AuthService = require('../auth/auth-service')
const logger = require('../logger')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        //
        logger.error('Missing bearer token @jwt-auth.js')
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user)
                    //
                    logger.error('Unauthorized request because !user @jwt-auth.js')
                    return res.status(401).json({ error: 'Unauthorized request' })
            req.user = user
            next()
        })
        .catch(next)
        /*
        .catch(err => {
            console.error(err)
            next(err)
        })*/
    } catch(error) {
        //
        logger.error('Unauthorized request because try fails @jwt-auth.js')
        res.status(401).json({ error: 'Unauthorized request' })
    }
}

module.exports = {
    requireAuth,
}



