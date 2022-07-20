const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (error, data) => error ? next(error) : res.json(data))
  }
}
module.exports = restaurantController
