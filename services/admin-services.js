const { Restaurant, Category, User } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminServices = {
  patchUser: async (req, callback) => {
    try {
      let user = await User.findByPk(req.params.user_id)
      if (user.email === 'root@example.com') throw new Error('禁止變更 root 權限')

      user = await user.update({
        isAdmin: !user.isAdmin
      })

      return callback(null, { user })
    } catch (error) {
      return callback(error)
    }
  },
  getRestaurants: async (req, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category]
      })
      return callback(null, { restaurants })
    } catch (error) {
      return callback(error)
    }
  },
  getRestaurant: async (req, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.rest_id, { // find a restaurant by primary key
        raw: true, // transform to plain object
        nest: true,
        include: [Category]
      })
      if (!restaurant) throw new Error("Restaurant didn't exist!") // didnot find a restaurant
      return callback(null, { restaurant })
    } catch (error) {
      return callback(error)
    }
  },
  postRestaurant: async (req, callback) => { // post of create restaurant page
    try {
      const { name, tel, address, openingHours, description, categoryId } = req.body
      if (!name) throw new Error('Restaurant name is required!')

      const { file } = req // = (const file = req.file)
      const filePath = await imgurFileHandler(file)
      const newRestaurant = await Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      })
      return callback(null, { restaurant: newRestaurant })
    } catch (error) {
      return callback(error)
    }
  },
  deleteRestaurant: async (req, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.rest_id)
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      const deletedRestaurant = await restaurant.destroy()
      return callback(null, { restaurant: deletedRestaurant })
    } catch (error) {
      return callback(error)
    }
  },
  editRestaurant: async (req, callback) => { // go to edit restaurant page
    try {
      const [restaurant, categories] = await Promise.all([
        Restaurant.findByPk(req.params.rest_id, { raw: true }),
        Category.findAll({ raw: true })
      ])
      if (!restaurant) throw new Error("Restaurant doesn't exist!") // didn't find a restaurant
      return callback(null, { restaurant, categories })
    } catch (error) {
      return callback(error)
    }
  },
  putRestaurant: async (req, callback) => { // update a restaurant
    try {
      const { name, tel, address, openingHours, description, categoryId } = req.body
      if (!name) throw new Error('Restaurant name is required!')

      const { file } = req // = const file = req.file

      let [restaurant, filePath] = await Promise.all([ // 非同步處理
        Restaurant.findByPk(req.params.rest_id), // 去資料庫查有沒有這間餐廳
        imgurFileHandler(file) // 把檔案傳到 file-helper 處理
      ])
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      restaurant = await restaurant.update({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || restaurant.image,
        categoryId
      })
      return callback(null,
        {
          restaurant
        }
      )
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = adminServices
