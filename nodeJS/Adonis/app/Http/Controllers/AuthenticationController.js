'use strict'

const CatLog = require('cat-log')
const log = new CatLog('AuthenticationController')

const User = use('App/Model/User')

class AuthenticationController {

  * login(request, response) {
    const username = request.input('username')
    const password = request.input('password')
    if (username && password) {

      try {

        const login = yield request.auth.attempt(username, password)
        log.debug(`user: ${username} attempted login result: ${login}`)
        if (login) {

          try {

            const user = yield User.query().where('username', username).first()

            const customClaims = {
              username: user.username,
              email: user.email,
              access: user.access
            }

            const jwt = request.auth.authenticator('jwt')
            const token = yield jwt.generate(user, customClaims)

            response.json({ token: token })
            return

          } catch (dbErr) {
            response.internalServerError('Database Misconfigured: ' + dbErr.message)
            return
          }
        }

      } catch (authErr) {

        if (/ECONNREFUSED/.test(authErr.message)) {
          log.error('Database Not Available: ' + authErr.message)
          response.serviceUnavailable()
          return
        }

        if (/Unable to find user/.test(authErr.message)) {
          log.error('Unknown User: ' + authErr.message)
          response.unauthorized('Invalid credentails')
          return
        }

        response.internalServerError('Unknown error: ' + authErr.message)
        return
      }

      log.warning('Unknown User: ' + authErr.message) // auth.attempt did not throw ?
      response.unauthorized('Invalid credentails')
      return
    }

    response.conflict('Missing parameters')
  }

  * logout(request, response) {
    const token = request.param('token')
    log.debug('logout token:', token)

    response.json({ success: true, message: 'user is logged out.', token: 'no-token' })
  }

}

module.exports = AuthenticationController
