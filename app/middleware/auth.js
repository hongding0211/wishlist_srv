module.exports = () => {
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

    const tokenExpiredTime = tokenBody.exp * 1000
    const expired =
      tokenBody?.exp != null ? Date.now() > tokenExpiredTime : true

    if (expired) {
      ctx.throw(403, 'Expired token.')
    }

    // 将 authToken 挂载到 ctx 上
    ctx.authToken = {
      token: authToken,
      expired: tokenExpiredTime,
    }

    await next()
  }
}
