const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')
const authenticated = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) { // already signin
    return next()
  } else { // haven't signin
    res.redirect('/signin')
  }
}
const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (ensureAuthenticated(req)) { // already signin
    if (getUser(req).isAdmin) return next() // user is Administration
    else res.redirect('/') // user is not Administration
  } else { // haven't signin
    res.redirect('/signin')
  }
}
module.exports = {
  authenticated,
  authenticatedAdmin
}