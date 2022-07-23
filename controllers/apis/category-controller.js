const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => { // show all categories
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}
module.exports = categoryController
