const { Comment, User, Restaurant } = require('../models')

const commentServices = {
  postComment: async (req, callback) => {
    try {
      const restaurantId = req.body.restaurantId
      const text = req.body.text.trim()
      const userId = req.user.id

      if (!text) throw new Error('Comment text is required!')

      const [user, restaurant] = await Promise.all([
        User.findByPk(userId),
        Restaurant.findByPk(restaurantId)
      ])
      if (!user) throw new Error("User didn't exist!")
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      await Comment.create({
        text,
        restaurantId,
        userId
      })

      return callback(
        null,
        {
          restaurantId
        }
      )
    } catch (error) {
      return callback(error)
    }
  },
  deleteComment: async (req, callback) => {
    try {
      const comment = await Comment.findByPk(req.params.comment_id,
        {
          include: [User],
          nest: true
        }
      )
      if (!comment) throw new Error("Comment didn't exist!'")
      const deletedComment = await comment.destroy()

      return callback(
        null,
        {
          deletedComment
        }
      )
    } catch (error) {
      return callback(error)
    }
  }
}
module.exports = commentServices
