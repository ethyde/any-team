import blizzardjs from 'blizzard.js'
import low from 'lowdb'
import FileAsync from 'lowdb/adapters/FileAsync'

const adapter = new FileAsync('data.json')

export default class WarcraftInit {
  constructor (option) {
    // this._message = option.message
    // this._arguments = option.arguments
    this._blizzardjs = null
  }

  init () {
    return low(adapter).then(db => {
      if (db.has('warcraft.access.bnetToken').value() && db.get('warcraft.access.bnetToken').value() === '') {
        console.log('No Token')
        return this.getToken().then(() => {
          return this.getApi()
        })
      } else {
        console.log('Token')
        return this.getApi()
      }
    })
  }

  getApi () {
    return low(adapter).then(db => {
      const getWarcraftAccess = db.get('warcraft.access').value()
      console.log('>>> getWarcraftAccess :', getWarcraftAccess)
      this._blizzardjs = blizzardjs.initialize({
        key: getWarcraftAccess.bnetKey,
        secret: getWarcraftAccess.bnetSecret,
        token: getWarcraftAccess.bnetToken,
        origin: 'eu',
        locale: 'fr_FR'
      })

      return this._blizzardjs
    })
  }

  getToken () {
    return low(adapter).then(db => {
      const getWarcraftAccess = db.get('warcraft.access').value()
      console.log('>>> getWracraft Token :', getWarcraftAccess)
      const getBnetToken = blizzardjs.initialize({
        key: getWarcraftAccess.bnetKey,
        secret: getWarcraftAccess.bnetSecret,
        origin: 'eu',
        locale: 'fr_FR'
      })

      getBnetToken.getApplicationToken().then(appToken => {
        console.log('>> appToken :', appToken.data.access_token)
        return db
          .set('warcraft.access.bnetToken', appToken.data.access_token)
          .write()
      })

      return getBnetToken
    })
  }
}
