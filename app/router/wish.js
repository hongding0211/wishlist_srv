/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, middleware, controller }) => {
  router.post('/wish/create', controller.wish.create)
  router.delete('/wish', controller.wish.delete)
  router.get('/wish/my', middleware.pagination(), controller.wish.my)
}
