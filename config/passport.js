const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

// set LocalStrategy
const customFields = {
  usernameField: 'email', // make default verify username to email
  passwordField: 'password', // make default verify password to password
  passReqToCallback: true
}
const verifyCallback = async (req, email, password, cb) => {
  const user = await User.findOne({ where: { email } })
  if (!user) return cb(null, false, req.flash('error_messages', '帳號輸入錯誤！'))
  const res = await bcrypt.compare(password, user.password)
  if (!res) return cb(null, false, req.flash('error_messages', '密碼輸入錯誤！'))

  return cb(null, user)
}
const localStrategy = new LocalStrategy(customFields, verifyCallback)
passport.use(localStrategy)

// set JWT - new JwtStrategy(options, verify)
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // 這個選項是設定去哪裡找 token，這裡指定了 authorization header 裡的 bearer token
  secretOrKey: process.env.JWT_SECRET // 使用密鑰來檢查 token 是否經過纂改，也就是我們放進 process.env.JWT_SECRET 的 'alphacamp' 字串，這組密鑰只有伺服器知道
}
const jwtVerifyCallback = async (jwtPayload, cb) => {
  try {
    const user = await User.findByPk(jwtPayload.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: Restaurant, as: 'LikedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
    return cb(null, user)
  } catch (error) {
    return cb(error)
  }
}
const jwtStrategy = new JWTStrategy(jwtOptions, jwtVerifyCallback)
passport.use(jwtStrategy)

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})
module.exports = passport
