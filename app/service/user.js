const Service = require('egg').Service

class UserService extends Service {
  findBySourceUid(sourceUid) {
    return this.ctx.model.User.find({
      source_uid: sourceUid,
    })
  }

  add(user) {
    return this.ctx.model.User.insertMany([user])
  }
}

module.exports = UserService
