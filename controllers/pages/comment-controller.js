const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('success_messages', 'postComment successfully')
        res.redirect(`/restaurants/${data.restaurantId}`, data)
      }
    })
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => {
      if (err) return next(err)
      else {
        req.flash('error_messages', 'deleteComment successfully')
        res.redirect(`/restaurants/${data.deletedComment.restaurantId}`, data)
      }
    })
  }
}
module.exports = commentController
