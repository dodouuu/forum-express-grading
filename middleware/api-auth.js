const passport = require('../config/passport') // 引入 passport

const authenticated = (req, res, next) => {
  const middleware = passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    else {
      req.user = user.dataValues
      next()
    }
  })

  middleware(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  else return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
