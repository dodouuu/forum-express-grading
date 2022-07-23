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
  deleteCategory: async (req, res, next) => { // delete a category from database
    try {
      const category = await Category.findByPk(req.params.cat_id)
      if (category == null) throw new Error("Category didn't exist!")
      await category.destroy()
      req.flash('error_messages', 'category delete successfully')
      return res.redirect('/admin/categories')
    } catch (error) {
      next(error)
    }
  }
}
module.exports = categoryController
