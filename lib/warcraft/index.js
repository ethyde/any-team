import blizzardjs from 'blizzard.js'

import low from 'lowdb'
import FileAsync from 'lowdb/adapters/FileAsync'

const adapter = new FileAsync('data.json')

export default class WarcraftInit {
  constructor (option) {
    this._blizzardjs = null
  }

  init () {
    return this.getApi()
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

      this._blizzardjs.axios.interceptors.response.use(
        response => {
          return response
        },
        error => {
          if (error.response.status === 401) {
            // place your reentry code
            return this.getToken().then(() => {
              return this.getApi()
            })
          }
          return error
        }
      )

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

      return getBnetToken.getApplicationToken().then(appToken => {
        console.log('>> appToken :', appToken.data.access_token)
        return db
          .set('warcraft.access.bnetToken', appToken.data.access_token)
          .write()
      })
    })
  }
}
