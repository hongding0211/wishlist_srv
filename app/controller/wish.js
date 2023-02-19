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
    this.success(found)
  }
}

module.exports = WishController
