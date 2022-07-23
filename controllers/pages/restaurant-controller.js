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
  getFeeds: async (req, res, next) => { // render top 10 feeds
    try {
      const [restaurants, comments] = await Promise.all(
        [
          Restaurant.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [Category],
            raw: true,
            nest: true
          }),
          Comment.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [User, Restaurant],
            raw: true,
            nest: true
          })
        ]
      )

      return res.render('feeds', {
        restaurants,
        comments
      })
    } catch (error) {
      next(error)
    }
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
