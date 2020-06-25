function requireAuth(req, res, next) {
    console.log('requireAuth')
    console.log(req.get('Authorization'))
    next()
}

module.exports = {
    requireAuth,
}


