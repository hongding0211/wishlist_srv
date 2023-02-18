const BaseController = require('./base')

class UserController extends BaseController {
  async login() {
    this.ctx.validate(
      {
        type: { type: 'enum', values: this.config.loginType },
        ticket: { type: 'string' },
      },
      this.ctx.query
    )

    const { type, ticket } = this.ctx.query

    try {
      let token

      switch (type) {
        case 'sso':
          token = await this.ctx.service.oauth.sso.login(ticket)
          break
        case 'wx':
          break
        default:
          break
      }

      // TODO 封装一层自己的 TOKEN 结构
      // 写入库中，和唯一的一个 uid 映射

      this.success({
        type,
        token,
      })
    } catch {
      this.error('Invalid ticket')
    }
  }
}

module.exports = UserController
