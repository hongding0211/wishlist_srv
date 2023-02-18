const BaseController = require('./base')
const { wrap } = require('../utlis/token')

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
      let token = 'haha'

      switch (type) {
        case 'sso':
          token = await this.ctx.service.oauth.sso.login(ticket)
          break
        case 'wx':
          break
        default:
          break
      }

      const wrappedToken = wrap({
        token,
        type,
      })

      this.success({
        token: wrappedToken,
      })
    } catch {
      this.error('Invalid ticket')
    }
  }

  async info() {
    this.ctx.validate(
      {
        token: { type: 'string' },
      },
      this.ctx.query
    )
  }
}

module.exports = UserController
