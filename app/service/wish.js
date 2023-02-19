const Service = require('egg').Service

class WishService extends Service {
  create(metaData) {
    const { _id } = this.ctx.token
    return this.ctx.model.Wish.insertMany([
      {
        creator: _id,
        created_at: Date.now(),
        modified_at: Date.now(),
        meta: metaData,
      },
    ])
  }

  delete(id) {
    const userId = this.ctx.token._id
    return this.ctx.model.Wish.deleteOne({
      creator: userId,
      _id: id,
    })
  }

  async my() {
    const { _id } = this.ctx.token
    const { page, size } = this.ctx.pagination

    const c1 = this.ctx.model.Wish.find({
      creator: _id,
    })
    const c2 = this.ctx.model.Wish.find({
      creator: _id,
    })

    this.ctx.pagination.total = await c2.countDocuments({})

    return c1.skip((page - 1) * size).limit(size)
  }
}

module.exports = WishService
