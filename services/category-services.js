const { Category } = require('../models')

const categoryServices = {
  getCategories: async (req, callback) => { // show all categories
    try {
      const [categories, category] = await Promise.all([
        Category.findAll({ raw: true }),
        Category.findByPk(req.params.cat_id, { raw: true })
      ])

      return callback(null, { categories, category })
    } catch (error) {
      return callback(error)
    }
  },
  putCategory: async (req, callback) => { // update a category into database
    try {
      const name = req.body.name.trim()

      if (!name) throw new Error('Category name is required!')

      let category = await Category.findOne(
        { where: { name: name } }
      )
      if (category !== null) {
        throw new Error('Category name exists!')
      } else {
        category = await Category.findByPk(req.params.cat_id)
        category = await category.update({ name })
        return callback(null, { category })
      }
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = categoryServices
