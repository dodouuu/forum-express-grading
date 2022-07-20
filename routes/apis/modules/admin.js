const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/apis/admin-controller')
const upload = require('../../../middleware/multer')

router.delete('/restaurants/:rest_id', adminController.deleteRestaurant) // delete a restaurant

router.post('/restaurants', upload.single('image'), adminController.postRestaurant) // create a restaurant
router.get('/restaurants', adminController.getRestaurants) // show all restaurants
module.exports = router
