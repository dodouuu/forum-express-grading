const bcrypt = require('bcryptjs') // 載入 bcrypt
const { User, Restaurant, Comment, Favorite, Like } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

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
  },
  getUser: async (req, callback) => { // go to Profile.hbs by user_id
    try {
      const queryUser = await User.findByPk(req.params.user_id,
        {
          include: [
            { model: Comment, include: [Restaurant] },
            { model: User, as: 'Followings' },
            { model: User, as: 'Followers' },
            { model: Restaurant, as: 'FavoritedRestaurants' }
          ],
          nest: true
        }
      )
      if (!queryUser) throw new Error("User didn't exist!") // didnot find a user
      const currentUser = req.user
      const isFollowed = currentUser.Followings.some(u => u.id === queryUser.id)

      return callback(null, { queryUser: queryUser.dataValues, isFollowed })
    } catch (error) {
      return callback(error)
    }
  },
  editUser: async (req, callback) => { // go to Profile edit page
    try {
      const user = await User.findByPk(req.params.user_id)
      return callback(null, { user: user.dataValues })
    } catch (error) {
      return callback(error)
    }
  },
  putUser: async (req, callback) => { // update Profile
    try {
      const name = req.body.name
      const { file } = req // = const file = req.file

      let [user, filePath] = await Promise.all(
        [
          User.findByPk(req.params.user_id),
          imgurFileHandler(file)
        ]
      )

      user = await user.update(
        {
          name,
          image: filePath || user.image
        }
      )
      return callback(null, { user: user.dataValues })
    } catch (error) {
      return callback(error)
    }
  },
  addFavorite: async (req, callback) => {
    try {
      const { restaurantId } = req.params
      const userId = req.user.id
      const [restaurant, favorite] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Favorite.findOne({
          where: {
            userId,
            restaurantId
          }
        })
      ])

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      if (favorite) throw new Error('You have favorited this restaurant!')

      await Favorite.create({
        userId: req.user.id,
        restaurantId
      })
      return callback(null, { userId, restaurantId })
    } catch (error) {
      return callback(error)
    }
  },
  removeFavorite: async (req, callback) => {
    try {
      const userId = req.user.id
      const restaurantId = req.params.restaurantId
      const favorite = await Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })
      if (!favorite) throw new Error("You haven't favorited this restaurant")

      await favorite.destroy()

      return callback(null, { userId, restaurantId })
    } catch (error) {
      return callback(error)
    }
  },
  addLike: async (req, callback) => {
    try {
      const { restaurantId } = req.params
      const userId = req.user.id
      const [restaurant, like] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Like.findOne({
          where: {
            userId,
            restaurantId
          }
        })
      ])

      if (!restaurant) throw new Error("Restaurant didn't exist!")
      if (like) throw new Error('You have liked this restaurant!')

      await Like.create({
        userId: req.user.id,
        restaurantId
      })
      return callback(null, { userId, restaurantId })
    } catch (error) {
      return callback(error)
    }
  },
  removeLike: async (req, callback) => {
    try {
      const userId = req.user.id
      const restaurantId = req.params.restaurantId
      const like = await Like.findOne({
        where: {
          userId,
          restaurantId
        }
      })
      if (!like) throw new Error("You haven't liked this restaurant")

      await like.destroy()
      return callback(null, { userId, restaurantId })
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = userServices
