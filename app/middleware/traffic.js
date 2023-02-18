const trafficMap = new Map()

module.exports = (options) => {
  return async function traffic(ctx, next) {
    const { uuid } = ctx.token
    if (uuid == null) {
      ctx.throw(401, 'Auth token is required.')
    }

    if (!trafficMap.has(uuid)) {
      trafficMap.set(uuid, {
        cnt: 0,
        expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      })
    }

    const t = trafficMap.get(uuid)

    t.cnt += t.cnt <= options.maxRequest ? 1 : 0

    if (t.cnt > options.maxRequest) {
      t.cnt--
      ctx.throw(500, 'Reach traffic limit.')
    } else {
      setTimeout(() => {
        // token 在被销毁时，队列上也可能还有定时任务
        const t = trafficMap.get(uuid)
        if (t == null) {
          return
        }

        t.cnt = t.cnt < 1 ? 0 : t.cnt - 1
        if (Date.now() > t.expireAt) {
          trafficMap.delete(uuid)
        }
      }, options.windowSize)
    }

    await next()
  }
}
