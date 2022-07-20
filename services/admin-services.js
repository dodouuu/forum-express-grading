const { Restaurant, Category } = require('../models')
const adminServices = {
  getRestaurants: async (req, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category]
      })
      return callback(null, { restaurants })
    } catch (error) {
      return callback(error)
    }
  },
  deleteRestaurant: async (req, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.rest_id)
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      const deletedRestaurant = await restaurant.destroy()
      return callback(null, { restaurant: deletedRestaurant })
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = adminServices
