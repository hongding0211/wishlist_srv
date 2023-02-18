const Service = require('egg').Service

class SSOService extends Service {
  /**
   * @param {string} ticket SSO ticket
   */
  async login(ticket) {
    const ssoConfig = this.config.sso

    const res = await this.ctx.curl(ssoConfig.api.validate.path, {
      method: ssoConfig.api.validate.method,
      contentType: 'json',
      data: {
        ticket,
      },
      dataType: 'json',
    })

    if (res.data.success === false) {
      throw new Error(res.data.msg)
    }

    return res.data.data.authToken
  }
}

module.exports = SSOService
