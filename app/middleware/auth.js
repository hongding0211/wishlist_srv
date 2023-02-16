// 用一个 set 来维护 token 缓存
// 如果 token 命中并且在有效期内，不再次查询
const tokenSet = new Set()

module.exports = (options) => {
  return async function auth(ctx, next) {
    const authToken =
      ctx.cookies.get('authToken') || ctx.request.query?.authToken

    if (authToken == null) {
      ctx.throw(401, 'Auth token is required.')
    }

    const jwtBodyMatcher = authToken.match(/^[\w-]+\.([\w-]+)\.[\w-]+$/)
    if (!jwtBodyMatcher?.length || jwtBodyMatcher.length < 2) {
      ctx.throw(403, 'Invalid token.')
    }
    const tokenBody = JSON.parse(atob(jwtBodyMatcher[1]))
    const expired =
      tokenBody?.exp != null
        ? Math.ceil(Date.now() / 1000) > tokenBody.exp
        : true

    if (tokenSet.has(authToken) && expired) {
      ctx.throw(403, 'Expired token.')
    }

    if (!tokenSet.has(authToken)) {
      const res = await ctx.curl(
        `${options.getUserInfo.path}?authToken=${authToken}`,
        {
          method: options.getUserInfo.method,
          dataType: 'json',
        }
      )

      const { status } = res
      if (status < 200 || status >= 300) {
        ctx.throw(403, 'Invalid token.')
      }

      tokenSet.add(authToken)
    }

    await next()
  }
}
