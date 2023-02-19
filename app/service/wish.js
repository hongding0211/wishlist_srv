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

    const c1 = this.ctx.model.Wish.find(
      {
        creator: _id,
      },
      {
        creator: 0,
        claimed_by: 0,
        claimed_at: 0,
      }
    )
    const c2 = this.ctx.model.Wish.find({
      creator: _id,
    })

    this.ctx.pagination.total = await c2.countDocuments({})

    return c1
      .sort({ modified_at: -1 })
      .skip((page - 1) * size)
      .limit(size)
  }

  findById(id) {
    return this.ctx.model.Wish.find({
      _id: id,
    })
  }

  async myClaimedCount() {
    const { _id } = this.ctx.token

    const total = await this.ctx.model.Wish.find({
      creator: _id,
    }).countDocuments({})

    const claimed = await this.ctx.model.Wish.find({
      creator: _id,
      claimed_by: { $exists: true },
    }).countDocuments({})

    return {
      total,
      claimed,
    }
  }

  async myClaims() {
    // TODO
  }

  async claim(wishId) {
    const userId = this.ctx.token._id

    const f = await this.ctx.model.Wish.find({
      _id: wishId,
    })

    if (f.length > 0 && f[0].claimed_by) {
      throw new Error('Wish has been claimed by this user.')
    }

    // TODO 自己也不能认领自己的，要做限制

    return this.ctx.model.Wish.updateOne(
      {
        _id: wishId,
      },
      {
        $set: {
          claimed_by: userId,
          claimed_at: Date.now(),
        },
      }
    )
  }

  async revertClaim(wishId) {
    const userId = this.ctx.token._id

    return this.ctx.model.Wish.updateOne(
      {
        _id: wishId,
        claimed_by: userId,
      },
      {
        $unset: {
          claimed_by: '',
          claimed_at: '',
        },
      }
    )
  }

  async wishesOf(uuid) {
    const { page, size } = this.ctx.pagination

    const f = await this.ctx.model.User.find({
      uuid,
    })

    if (f.length < 1) {
      throw new Error('Invalid uuid.')
    }

    // if (f[0].uuid === uuid) {
    //   throw new Error('Are you trying to hack something here?')
    // }

    const userId = f[0]._id

    const c1 = this.ctx.model.Wish.find({
      creator: userId,
    })

    this.ctx.pagination.total = await c1.countDocuments({})

    // TODO 要做一个 look 聚合下用户数据
    return this.ctx.model.Wish.find(
      {
        creator: userId,
      },
      {
        creator: 0,
      }
    )
      .sort({ modified_at: -1 })
      .skip((page - 1) * size)
      .limit(size)
  }

  async plaza() {
    // TODO
  }
}

module.exports = WishService
