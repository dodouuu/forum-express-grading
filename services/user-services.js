const bcrypt = require('bcryptjs') // 載入 bcrypt
const { User } = require('../models')

const userServices = {
  signUp: async (req, callback) => {
    try {
      // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
      if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

      // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
      const user = await User.findOne({ where: { email: req.body.email } })

      if (user) throw new Error('Email already exists!')

      const hash = await bcrypt.hash(req.body.password, 10)

      const newUser = await User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      })
      delete newUser.dataValues.password
      return callback(null, { user: newUser })
    } catch (error) {
      return callback(error)
    }
  },
  getTopUsers: async (req, callback) => {
    try {
      // get every user and her followers
      const users = await User.findAll({
        include: [{ model: User, as: 'Followers' }]
      })
      // result is a sorted array include two new properties: followerCount, isFollowed
      const result = users
        .map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.some(f => f.id === user.id) // if this user followed by req.user ?
        }))
        .sort((a, b) => b.followerCount - a.followerCount)
      return callback(null, { users: result })
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = userServices
