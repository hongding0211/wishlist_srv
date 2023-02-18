/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, middleware, controller }) => {
  router.get('/user/login', controller.user.login)
  router.get('/user/info', middleware.auth(), controller.user.info)
}
