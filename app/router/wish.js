/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, middleware, controller }) => {
  router.post('/wish/create', controller.wish.create)
  router.delete('/wish', controller.wish.delete)
  router.get('/wish/my', middleware.pagination(), controller.wish.my)
  router.post('/wish/claim', controller.wish.claim)
  router.post('/wish/revertClaim', controller.wish.revertClaim)
  router.get('/wish/of', middleware.pagination(), controller.wish.wishesOf)
  router.get('/wish/myClaimedCount', controller.wish.myClaimedCount)
  router.get('/wish/plaza', middleware.pagination(), controller.wish.plaza)
  router.get(
    '/wish/myClaims',
    middleware.pagination(),
    controller.wish.myClaims
  )
}
