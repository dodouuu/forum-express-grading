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
  }
}
module.exports = categoryServices
