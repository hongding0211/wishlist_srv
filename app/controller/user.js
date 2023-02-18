const BaseController = require('./base')
const { wrap } = require('../utlis/token')
const short = require('short-uuid')

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
      let tokenData, userData, uuid

      switch (type) {
        case 'sso':
          tokenData = await this.ctx.service.oauth.sso.login(ticket)
          break
        case 'wx':
          break
        default:
          break
      }

      // TODO 读库查看是否有记录，没有记录往库里写一下
      const { uid, authToken } = tokenData

      const found = await this.ctx.service.user.findBySourceUid(uid)

      if (found.length < 1) {
        uuid = short.uuid()

        switch (type) {
          case 'sso': {
            const d = await this.ctx.service.oauth.sso.getUserData(authToken)
            userData = {
              uuid,
              name: d.name,
              source: type,
              source_uid: uid,
              avatar: d.avatar,
            }
            break
          }
          case 'wx':
            break
          default:
            break
        }

        await this.ctx.service.user.add(userData)
      } else {
        uuid = found[0].uuid
      }

      const wrappedToken = wrap({
        uuid,
      })

      this.success({
        token: wrappedToken,
      })
    } catch {
      this.error('Invalid ticket')
    }
  }

  async info() {
    // TODO
    this.success(this.ctx.token)
  }
}

module.exports = UserController
