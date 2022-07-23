const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (error, data) => error ? next(error) : res.json({ status: 'success', data }))
  },
  getTopRestaurants: (req, res, next) => { // render most favorited top 10 restaurants
    restaurantServices.getTopRestaurants(req, (error, data) => error ? next(error) : res.json({ status: 'success', data }))
  }
}
module.exports = restaurantController
