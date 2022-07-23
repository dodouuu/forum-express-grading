const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/apis/admin-controller')
const upload = require('../../../middleware/multer')

router.get('/restaurants/:rest_id/edit', adminController.editRestaurant) // get data for admin edit restaurant page
router.get('/restaurants/:rest_id', adminController.getRestaurant) // show a restaurant
router.put('/restaurants/:rest_id', upload.single('image'), adminController.putRestaurant) // update a restaurant
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant) // delete a restaurant

router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // create a restaurant
router.get('/restaurants', adminController.getRestaurants) // show all restaurants
module.exports = router
