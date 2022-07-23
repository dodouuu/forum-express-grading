const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')

const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

const upload = require('../../middleware/multer')

const admin = require('./modules/admin')

router.use('/admin', authenticated, authenticatedAdmin, admin)

router.post('/signup', userController.signUp) // create new user into database
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn) // disable sessions
router.get('/users/top', authenticated, userController.getTopUsers) // get top-users
router.get('/users/:user_id/edit', authenticated, userController.editUser) // get user's data for Profile edit page
router.get('/users/:user_id', authenticated, userController.getUser) // get user's data for Profile page
router.put('/users/:user_id', authenticated, upload.single('image'), userController.putUser) // update Profile

router.get('/restaurants/top', authenticated, restController.getTopRestaurants) // render most favorited top 10 restaurants
router.get('/restaurants/feeds', authenticated, restController.getFeeds) // render top 10 feeds
router.get('/restaurants/:rest_id/dashboard', authenticated, restController.getDashboard) // render dashboard of a restaurant
router.get('/restaurants/:rest_id', authenticated, restController.getRestaurant) // render a restaurant
router.get('/restaurants', authenticated, restController.getRestaurants) // render all restaurants

router.delete('/comments/:comment_id', authenticated, authenticatedAdmin, commentController.deleteComment) // delete a comment by id
router.post('/comments', authenticated, commentController.postComment) // create a new comment into database

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite) // add a restaurant into join table
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite) // remove a restaurant from join table
router.post('/like/:restaurantId', authenticated, userController.addLike) // add a restaurant into join table
router.delete('/like/:restaurantId', authenticated, userController.removeLike) // remove a restaurant from join table

router.use('/', apiErrorHandler)
module.exports = router
