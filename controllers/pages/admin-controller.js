const { User, Category } = require('../../models')
const adminServices = require('../../services/admin-services')

const adminController = {
  patchUser: async (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users', data)
      }
    })
  },
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        raw: true
      })
      return res.render('admin/users', { users })
    } catch (error) {
      throw new Error('getUsers error')
    }
  },
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    adminServices.getRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.render('admin/restaurant', data)
    })
  },
  createRestaurant: (req, res, next) => { // go to create restaurant page
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => { // post of create restaurant page
    adminServices.postRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'restaurant was created successfully')
      res.redirect('/admin/restaurants', data)
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => err ? next(err) : res.redirect('/admin/restaurants', data))
  },
  editRestaurant: (req, res, next) => { // go to edit restaurant page
    adminServices.editRestaurant(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('admin/edit-restaurant', data)
      }
    })
  },
  putRestaurant: (req, res, next) => { // update a restaurant
    adminServices.putRestaurant(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', 'restaurant was updated successfully')
        res.redirect('/admin/restaurants', data)
      }
    })
  }
}
module.exports = adminController
