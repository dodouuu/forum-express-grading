const jwt = require('jsonwebtoken')
const userServices = require('../../services/user-services')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT，效期為 30 天
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => {
      if (err) return next(err)
      else res.json({ status: 'success', data })
    })
  },
  getUser: (req, res, next) => { // get user's data for Profile page
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      else res.json({ status: 'success', data })
    })
  },
  editUser: (req, res, next) => { // get user's data for Profile edit page
    userServices.editUser(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  putUser: (req, res, next) => { // update Profile
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  }
}
module.exports = userController
