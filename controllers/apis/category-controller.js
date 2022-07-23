const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => { // show all categories
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putCategory: (req, res, next) => { // update a category into database
    categoryServices.putCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postCategory: (req, res, next) => { // create new category into database
    categoryServices.postCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteCategory: (req, res, next) => { // create new category into database
    categoryServices.deleteCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}
module.exports = categoryController
