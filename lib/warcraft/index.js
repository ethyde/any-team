import blizzardjs from 'blizzard.js'

import Tokens from '../helpers/dbTokens'

export default class WarcraftInit {
  constructor (option) {
    this._blizzardjs = null
  }

  async init () {
    const getWarcraftKey = await Tokens.findOne({ where: { name: 'bnetKey' } })
    const getWarcraftSecret = await Tokens.findOne({ where: { name: 'bnetSecret' } })
    const getWarcraftToken = await Tokens.findOne({ where: { name: 'bnetToken' } })

    const isWarcraftOkenDefined = getWarcraftToken !== null ? getWarcraftToken.token : ''

    this._blizzardjs = await blizzardjs.initialize({
      key: getWarcraftKey.token,
      secret: getWarcraftSecret.token,
      token: isWarcraftOkenDefined,
      origin: 'eu',
      locale: 'fr_FR'
    })
    return this.getApi(isWarcraftOkenDefined)
  }

  getApi (auth) {
    console.log('>>> auth :', auth)
    return this._blizzardjs
      .validateApplicationToken({
        token: auth,
        origin: 'eu'
      })
      .then(result => {
        return this._blizzardjs
      })
      .catch(error => {
        console.log('>>> error', error.response.data.error)
        if (error.response.data.error === 'invalid_token') {
          return this.getToken()
        }
      })
  }

  getToken () {
    return this._blizzardjs.getApplicationToken().then(async appToken => {
      await Tokens.create({
        name: 'bnetToken',
        token: appToken.data.access_token
      })
      return this.init()
    })
  }
}
