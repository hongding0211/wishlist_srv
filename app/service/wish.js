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
    const { _id } = this.ctx.token

    const userId = new this.app.mongoose.Types.ObjectId(_id)

    const { page, size } = this.ctx.pagination

    this.ctx.pagination.total = await this.ctx.model.Wish.find({
      claimed_by: userId,
    }).countDocuments({})

    return this.ctx.model.Wish.aggregate([
      {
        $match: { claimed_by: userId },
      },
      {
        $lookup: {
          from: 'users',
          as: 'userArr',
          localField: 'creator',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$userArr',
        },
      },
      {
        $project: {
          _id: 0,
          wishId: '$_id',
          createdAt: '$created_at',
          modifiedAt: '$modified_at',
          meta: 1,
          creator: {
            uuid: '$userArr.uuid',
            name: '$userArr.name',
            avatar: '$userArr.avatar',
          },
        },
      },
    ])
      .sort({ modifiedAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
  }

  async claim(wishId) {
    const userId = this.ctx.token._id

    const f = await this.ctx.model.Wish.find({
      _id: wishId,
    })

    if (f.length < 1) {
      throw new Error('Invalid wish id.')
    }

    if (f[0].claimed_by) {
      throw new Error('Wish has been claimed.')
    }

    // 左边是 Object 右边是 string
    // 左边是 bson type 的对象，原型上有 toString() 方法
    if (f[0].creator.toString() === userId) {
      throw new Error('You cannot claim a wish from your own.')
    }

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
    const { _id } = this.ctx.token
    const { page, size } = this.ctx.pagination

    const f = await this.ctx.model.User.find({
      uuid,
    })

    if (f.length < 1) {
      throw new Error('Invalid uuid.')
    }

    if (f[0]._id.toString() === _id) {
      throw new Error('Are you trying to hack something here?')
    }

    const userId = f[0]._id

    const c1 = this.ctx.model.Wish.find({
      creator: userId,
    })

    this.ctx.pagination.total = await c1.countDocuments({})

    return this.ctx.model.Wish.aggregate([
      {
        $match: { creator: userId },
      },
      {
        $lookup: {
          from: 'users',
          as: 'userArr',
          localField: 'claimed_by',
          foreignField: '_id',
        },
      },
      {
        $unwind: {
          path: '$userArr',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          wishId: '$_id',
          createdAt: '$created_at',
          modifiedAt: '$modified_at',
          meta: 1,
          claimedBy: {
            uuid: '$userArr.uuid',
            name: '$userArr.name',
            avatar: '$userArr.avatar',
          },
        },
      },
    ])
      .sort({ modifiedAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
  }

  async plaza(top) {
    const { _id } = this.ctx.token

    const { page, size } = this.ctx.pagination

    const userId = new this.app.mongoose.Types.ObjectId(_id)

    this.ctx.pagination.total =
      (
        await this.ctx.model.Wish.aggregate([
          {
            $match: { creator: { $ne: userId } },
          },
          {
            $group: {
              _id: '$creator',
            },
          },
          {
            $count: 'total',
          },
        ])
      )[0]?.total || 0

    return this.ctx.model.Wish.aggregate([
      {
        $match: { creator: { $ne: userId } },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'claimed_by',
          foreignField: '_id',
          as: 'claimedBy',
        },
      },
      {
        $unwind: {
          path: '$claimedBy',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          claimedBy: {
            _id: 0,
            source: 0,
            source_uid: 0,
            __v: 0,
          },
        },
      },
      {
        $group: {
          _id: '$creator',
          top: {
            $topN: {
              n: top,
              sortBy: { modified_at: 1 },
              output: {
                wishId: '$_id',
                createdAt: '$created_at',
                modifiedAt: '$modified_at',
                meta: '$meta',
                claimedAt: '$claimed_at',
                claimedBy: '$claimedBy',
              },
            },
          },
          lastModified: {
            $max: '$modified_at',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },
      {
        $project: {
          _id: 0,
          lastModified: 1,
          top: 1,
          creator: {
            uuid: 1,
            name: 1,
            avatar: 1,
          },
        },
      },
    ])
      .sort({ lastModified: -1 })
      .skip((page - 1) * size)
      .limit(size)
  }
}

module.exports = WishService
