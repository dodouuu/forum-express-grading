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
  }
}
module.exports = adminServices
