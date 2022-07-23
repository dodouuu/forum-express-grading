const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: async (req, callback) => {
    const FIRST_RENDER_PAGE = 1
    const DEFAULT_LIMIT = 9

    try {
      const page = Number(req.query.page) || FIRST_RENDER_PAGE
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(limit, page)

      const categoryId = Number(req.query.categoryId) || ''
      const [restaurants, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          include: [Category],
          where: {
            ...categoryId ? { categoryId } : {}
          },
          limit,
          offset,
          nest: true,
          raw: true
        }),
        Category.findAll({ raw: true })
      ])
      const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []

      const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []

      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description ? r.description.substring(0, 50) : '', // show only first 50 characters
        isFavorited: favoritedRestaurantsId.includes(r.id), // if (r.id in favoritedRestaurantsId) => true
        isLiked: likedRestaurantsId.includes(r.id) // if (r.id in likedRestaurantsId) => true
      }))
      return callback(
        null,
        {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        }
      )
    } catch (error) {
      return callback(error)
    }
  },
  getRestaurant: async (req, callback) => {
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

      return callback(
        null,
        {
          restaurant: restaurant.toJSON(),
          comments,
          isFavorited: restaurant.FavoritedUsers.some(fu => fu.id === req.user.id),
          isLiked: restaurant.LikedUsers.some(lu => lu.id === req.user.id)
        }
      )
    } catch (error) {
      return callback(error)
    }
  },
  getDashboard: async (req, callback) => {
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

      return callback(
        null,
        {
          restaurant,
          commentCounts: comments.count
        }
      )
    } catch (error) {
      return callback(error)
    }
  },
  getFeeds: async (req, callback) => { // render top 10 feeds
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

      return callback(
        null,
        {
          restaurants,
          comments
        }
      )
    } catch (error) {
      return callback(error)
    }
  },
  getTopRestaurants: async (req, callback) => { // render most favorited top 10 restaurants
    try {
      const rests = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }]
      })
      const result = rests
        .map(rest => {
          return (
            {
              ...rest.dataValues,
              favoritedCount: rest.FavoritedUsers.length,
              isFavorited: req.user !== undefined ? req.user.FavoritedRestaurants.some(r => r.id === rest.id) : false // if this restaurant in req.user.FavoritedRestaurants
            }
          )
        })
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)
      // return res.render('top-restaurants', { restaurants: result })
      return callback(
        null,
        {
          restaurants: result
        }
      )
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = restaurantServices
