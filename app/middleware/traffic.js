const trafficMap = new Map()

module.exports = (options) => {
  return async function traffic(ctx, next) {
    const { authToken } = ctx
    if (authToken == null) {
      ctx.throw(401, 'Auth token is required.')
    }

    const { token, expired } = authToken

    if (!trafficMap.has(token)) {
      trafficMap.set(token, {
        cnt: 0,
        expireAt: expired,
      })
    }

    const t = trafficMap.get(token)

    t.cnt += t.cnt <= options.maxRequest ? 1 : 0

    if (t.cnt > options.maxRequest) {
      t.cnt--
      ctx.throw(500, 'Reach traffic limit.')
    } else {
      setTimeout(() => {
        // token 在被销毁时，队列上也可能还有定时任务
        const t = trafficMap.get(token)
        if (t == null) {
          return
        }

        t.cnt = t.cnt < 1 ? 0 : t.cnt - 1
        if (Date.now() > t.expireAt) {
          trafficMap.delete(token)
        }
      }, options.windowSize)
    }

    await next()
  }
}
