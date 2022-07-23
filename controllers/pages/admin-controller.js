const { Restaurant, User, Category } = require('../../models')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const adminServices = require('../../services/admin-services')

const adminController = {
  patchUser: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.user_id)
      if (user.email !== 'root@example.com') {
        await user.update({
          isAdmin: !user.isAdmin
        })
        req.flash('success_messages', '使用者權限變更成功')
        return res.redirect('/admin/users')
      } else {
        req.flash('error_messages', '禁止變更 root 權限')
        return res.redirect('back')
      }
    } catch (error) {
      throw new Error('patchUser error')
    }
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
    Restaurant.findByPk(req.params.rest_id, { // find a restaurant by primary key
      raw: true, // transform to plain object
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") // didnot find a restaurant
        else res.render('admin/restaurant', { restaurant }) // find a restaurant successfully
      })
      .catch(err => next(err))
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
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req // = const file = req.file
    Promise.all([ // 非同步處理
      Restaurant.findByPk(req.params.rest_id), // 去資料庫查有沒有這間餐廳
      imgurFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was updated successfully')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  }
}
module.exports = adminController
