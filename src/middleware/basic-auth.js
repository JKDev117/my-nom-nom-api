const AuthService = require('../auth/auth-service')
const logger = require('../logger')

function requireAuth(req, res, next) {

    const authToken = req.get('Authorization') || ''

    let basicToken
    if(!authToken.toLowerCase().startsWith('basic ')){
        logger.error('Unauthorized request')
        return res.status(401).json({error: 'Missing basic token'})
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)
    
    if(!tokenUserName || !tokenPassword){
        logger.error('Unauthorized request')
        return res.status(401).json({error: 'Unauthorized request'})
    }

    AuthService.getUserWithUserName(req.app.get('db'), tokenUserName)
      .then(user => {
        if (!user || user.password !== tokenPassword) {
          logger.error('Unauthorized request')
          return res.status(401).json({ error: 'Unauthorized request' })
        }
        req.user = user
        next()
      })
      .catch(next)
}

module.exports = {
    requireAuth,
}


