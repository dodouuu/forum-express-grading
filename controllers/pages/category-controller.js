const { Category } = require('../../models')
const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => { // show all categories
    categoryServices.getCategories(req, (err, data) => {
      if (err) return next(err)
      else {
        res.render('admin/categories', data)
      }
    })
  },
  putCategory: (req, res, next) => { // update a category into database
    categoryServices.putCategory(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', 'category update successfully')
        res.redirect('/admin/categories', data)
      }
    })
  },
  postCategory: (req, res, next) => { // create new category into database
    categoryServices.postCategory(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', 'category create successfully')
        res.redirect('/admin/categories', data)
      }
    })
  },
  deleteCategory: (req, res, next) => { // delete a category from database
    categoryServices.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('error_messages', 'category delete successfully')
        res.redirect('/admin/categories', data)
      }
    })
  }
}
module.exports = categoryController
