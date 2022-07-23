const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (error, data) => error ? next(error) : res.json({ status: 'success', data }))
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (error, data) => error ? next(error) : res.json({ status: 'success', data }))
  }
}
module.exports = commentController
