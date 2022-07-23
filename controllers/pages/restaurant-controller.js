const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (error, data) => error ? next(error) : res.render('restaurants', data))
  },
  getRestaurant: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.rest_id,
        {
          include: [
            Category,
            { model: Comment, include: [User] },
            { model: User, as: 'FavoritedUsers' },
            { model: User, as: 'LikedUsers' }
          ],
          nest: true
        }
      )
      if (!restaurant) throw new Error("Restaurant didn't exist!") // didnot find a restaurant

      const comments = await Comment.findAll(
        {
          include: [User],
          where: { restaurantId: restaurant.id },
          order: [
            ['createdAt', 'DESC']
          ],
          raw: true,
          nest: true
        }
      )

      await restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        comments,
        isFavorited: restaurant.FavoritedUsers.some(f => f.id === req.user.id),
        isLiked: restaurant.LikedUsers.some(f => f.id === req.user.id)
      })
    } catch (error) {
      next(error)
    }
  },
  getDashboard: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.rest_id,
        {
          include: [Category],
          nest: true,
          raw: true
        }
      )
      if (!restaurant) throw new Error("Restaurant didn't exist!") // didnot find a restaurant

      const comments = await Comment.findAndCountAll(
        {
          where: {
            restaurantId: req.params.rest_id
          }
        }
      )

      return res.render('dashboard', {
        restaurant,
        commentCounts: comments.count
      })
    } catch (error) {
      next(error)
    }
  },
  getFeeds: (req, res, next) => { // render top 10 feeds
    restaurantServices.getFeeds(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('feeds', data)
      }
    })
  },
  getTopRestaurants: (req, res, next) => { // render most favorited top 10 restaurants
    restaurantServices.getTopRestaurants(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('top-restaurants', data)
      }
    })
  }
}
module.exports = restaurantController
