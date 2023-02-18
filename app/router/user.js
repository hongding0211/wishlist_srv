/**
 * @param {Egg.Application} app - egg application
 */
module.exports = ({ router, controller }) => {
  router.get('/user/login', controller.user.login)
  router.get('/user/info', controller.user.info)
}
