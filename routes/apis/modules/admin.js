const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')
const upload = require('../../../middleware/multer')

router.get('/restaurants/:rest_id/edit', adminController.editRestaurant) // get data for admin edit restaurant page
router.get('/restaurants/:rest_id', adminController.getRestaurant) // show a restaurant
router.put('/restaurants/:rest_id', upload.single('image'), adminController.putRestaurant) // update a restaurant
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant) // delete a restaurant
router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // create a restaurant
router.get('/restaurants', adminController.getRestaurants) // show all restaurants

router.patch('/users/:user_id', adminController.patchUser) // switch admin <=> user
router.get('/users', adminController.getUsers) // show all users

router.get('/categories/:cat_id', categoryController.getCategories) // show category edit page
router.put('/categories/:cat_id', categoryController.putCategory) // update a category into database
router.get('/categories', categoryController.getCategories) // show category create page
router.post('/categories', categoryController.postCategory) // create new category into database

module.exports = router
