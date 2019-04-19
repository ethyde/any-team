import blizzardjs from 'blizzard.js'

import low from 'lowdb'
import FileAsync from 'lowdb/adapters/FileAsync'

const adapter = new FileAsync('data.json')

export default class WarcraftInit {
  constructor (option) {
    this._blizzardjs = null
  }

  init () {
    return low(adapter).then(db => {
      const getWarcraftAccess = db.get('warcraft.access').value()
      this._blizzardjs = blizzardjs.initialize({
        key: getWarcraftAccess.bnetKey,
        secret: getWarcraftAccess.bnetSecret,
        token: getWarcraftAccess.bnetToken,
        origin: 'eu',
        locale: 'fr_FR'
      })
      return this.getApi(getWarcraftAccess)
    })
  }

  getApi (auth) {
    return this._blizzardjs
      .validateApplicationToken({
        token: auth.bnetToken,
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
    return low(adapter).then(db => {
      return this._blizzardjs.getApplicationToken().then(appToken => {
        db.set('warcraft.access.bnetToken', appToken.data.access_token).write()
        return this.init()
      })
    })
  }
}
