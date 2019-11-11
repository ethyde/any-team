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
    return this._blizzardjs
      .validateApplicationToken({
        token: auth,
        origin: 'eu'
      })
      .then(result => {
        return this._blizzardjs
      })
      .catch(error => {
        if (error.response.data.error === 'invalid_token') {
          return this.getToken()
        }
      })
  }

  getToken () {
    return this._blizzardjs.getApplicationToken().then(async appToken => {
      const foundItem = await Tokens.findOne({ where: { name: 'bnetToken' } })

      if (!foundItem) {
        // Item not found, create a new one
        await Tokens.create({
          name: 'bnetToken',
          token: appToken.data.access_token
        })
      } else {
        await Tokens.update({ token: appToken.data.access_token }, { where: { name: 'bnetToken' } })
      }

      return this.init()
    })
  }
}
