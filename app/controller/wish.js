const BaseController = require('./base')

class WishController extends BaseController {
  async create() {
    const data = this.ctx.request.body

    if (!data) {
      this.error('Empty Data')
      return
    }

    const insert = await this.ctx.service.wish.create(data)

    if (insert.length < 1) {
      this.error('Insert failed.')
      return
    }

    const d = insert[0]

    this.success({
      id: d._id,
      createdAt: d.created_at,
      modifiedAt: d.modified_at,
      meta: d.meta,
    })
  }

  async delete() {
    this.ctx.validate(
      {
        id: { type: 'string' },
      },
      this.ctx.query
    )

    const { id } = this.ctx.query

    const d = await this.ctx.service.wish.delete(id)

    if (d.deletedCount > 0) {
      this.success({
        id,
      })
    } else {
      this.error('Delete failed.')
    }
  }

  async my() {
    const found = await this.ctx.service.wish.my()
    this.success(
      found.map((w) => ({
        wishId: w._id,
        createdAt: w.created_at,
        modifiedAt: w.modified_at,
        meta: w.meta,
      }))
    )
  }

  async myClaimedCount() {
    this.success(await this.service.wish.myClaimedCount())
  }

  async myClaims() {
    // TODO
  }

  async claim() {
    this.ctx.validate(
      {
        id: { type: 'string' },
      },
      this.ctx.request.body
    )

    const { id } = this.ctx.request.body

    const f = await this.ctx.service.wish.findById(id)
    if (f.length < 1) {
      this.error('Invalid wish id.')
      return
    }

    try {
      const r = await this.ctx.service.wish.claim(id)

      if (r.nModified > 0) {
        this.success({
          wishId: id,
        })
      }
    } catch (e) {
      this.error(e.message)
    }
  }

  async revertClaim() {
    this.ctx.validate(
      {
        id: { type: 'string' },
      },
      this.ctx.request.body
    )

    const { id } = this.ctx.request.body

    const r = await this.ctx.service.wish.revertClaim(id)

    if (r.nModified > 0) {
      this.success({
        revertedClaimId: id,
      })
    } else {
      this.error('Revert failed.')
    }
  }

  async wishesOf() {
    this.ctx.validate(
      {
        uuid: { type: 'string' },
      },
      this.ctx.query
    )

    const { uuid } = this.ctx.query

    try {
      const found = await this.ctx.service.wish.wishesOf(uuid)
      this.success(
        found.map((w) => ({
          wishId: w._id,
          createdAt: w.created_at,
          modifiedAt: w.modified_at,
          meta: w.meta,
          claimedAt: w.claimed_at,
          claimedBy: w.claimed_by,
        }))
      )
    } catch (e) {
      this.error(e.message)
    }
  }

  async plaza() {
    // TODO
  }
}

module.exports = WishController
