const { Restaurant, Category } = require('../models')
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
        description: r.description.substring(0, 50), // show only first 50 characters
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
  }
}
module.exports = restaurantServices
