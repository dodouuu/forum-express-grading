const { User, Restaurant, Favorite, Like, Followship } = require('../../models')
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
  getUser: (req, res, next) => { // go to Profile.hbs by user_id
    userServices.getUser(req, (err, data) => {
      if (err) return next(err)
      else res.render('users/profile', data)
    })
  },
  editUser: (req, res, next) => { // go to Profile edit page
    userServices.editUser(req, (err, data) => {
      if (err) return next(err)
      else res.render('users/edit', data)
    })
  },
  putUser: (req, res, next) => { // update Profile
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${data.user.id}`, data) // back to Profile page
      }
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', 'addFavorite successfully')
        res.redirect('back', data)
      }
    })
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('error_messages', 'removeFavorite successfully')
        res.redirect('back', data)
      }
    })
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
  getTopUsers: (req, res, next) => {
    userServices.getTopUsers(req, (err, data) => {
      if (err) return next(err)
      res.render('top-users', data)
    })
  }
}

module.exports = userController
