const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../../models')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊帳號！')
      res.redirect('/signin', data)
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('warning_messages', '成功登出！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: async (req, res, next) => { // go to Profile.hbs by user_id
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

      return res.render('users/profile',
        { queryUser: queryUser.dataValues, isFollowed }
      )
    } catch (error) {
      next(error)
    }
  },
  editUser: async (req, res, next) => { // go to Profile edit page
    try {
      const user = await User.findByPk(req.params.user_id)
      res.render('users/edit', { user: user.toJSON() })
    } catch (error) {
      next(error)
    }
  },
  putUser: async (req, res, next) => { // update Profile
    try {
      const name = req.body.name
      const { file } = req // = const file = req.file

      const [user, filePath] = await Promise.all(
        [
          User.findByPk(req.params.user_id),
          imgurFileHandler(file)
        ]
      )

      await user.update(
        {
          name,
          image: filePath || user.image
        }
      )
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${user.id}`)
    } catch (error) {
      next(error)
    }
  },
  addFavorite: async (req, res, next) => {
    try {
      const { restaurantId } = req.params
      const [restaurant, favorite] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Favorite.findOne({
          where: {
            userId: req.user.id,
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
      req.flash('success_messages', 'addFavorite successfully')
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  removeFavorite: async (req, res, next) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId: req.params.restaurantId
        }
      })
      if (!favorite) throw new Error("You haven't favorited this restaurant")

      await favorite.destroy()
      req.flash('error_messages', 'removeFavorite successfully')

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  addLike: async (req, res, next) => {
    try {
      const { restaurantId } = req.params
      const [restaurant, like] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        Like.findOne({
          where: {
            userId: req.user.id,
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
      req.flash('success_messages', 'addLike successfully')
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  removeLike: async (req, res, next) => {
    try {
      const like = await Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId: req.params.restaurantId
        }
      })
      if (!like) throw new Error("You haven't liked this restaurant")

      await like.destroy()
      req.flash('error_messages', 'removeLike successfully')

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  addFollowing: async (req, res, next) => {
    try {
      const { userId } = req.params
      const [user, followship] = await Promise.all([
        User.findByPk(userId),
        Followship.findOne({
          where: {
            followerId: req.user.id,
            followingId: userId
          }
        })
      ])

      if (!user) throw new Error("User didn't exist!")
      if (followship) throw new Error('You are already following this user!')

      await Followship.create({
        followerId: req.user.id,
        followingId: userId
      })
      req.flash('success_messages', 'addFollowing successfully')
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
      if (!followship) throw new Error("You haven't followed this user!")

      await followship.destroy()
      req.flash('error_messages', 'removeFollowing successfully')

      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  getTopUsers: async (req, res, next) => {
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
      return res.render('top-users', { users: result })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
