const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (error, data) => error ? next(error) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('restaurant', data)
      }
    })
  },
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('dashboard', data)
      }
    })
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
