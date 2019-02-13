import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

import blizzardjs from 'blizzard.js'

const adapter = new FileSync('data.json')
const db = low(adapter)

export default class WarcraftInit {
  constructor (option) {
    this._message = option.message
    this._arguments = option.arguments
    this._blizzardjs = null
  }

  init () {
    if (db.has('warcraft.access.bnetToken').value()) {
      const getWarcraftToken = db
        .get('warcraft.access')
        .value()
      this._blizzardjs = blizzardjs.initialize({
        key: getWarcraftToken.bnetKey,
        secret: getWarcraftToken.bnetSecret,
        token: getWarcraftToken.bnetToken,
        origin: 'eu',
        locale: 'fr_FR'
      })
      this.processCommand()
    } else {
      this.getToken()
    }
  }

  getToken () {
    console.log('>>> this get token')
    const getWarcraftToken = db
      .get('warcraft.access')
      .value()
    this._key = getWarcraftToken.bnetKey
    this._secret = getWarcraftToken.bnetSecret

    const getAppToken = blizzardjs.initialize({
      key: this._key,
      secret: this._secret,
      origin: 'eu',
      locale: 'fr_FR'
    })

    getAppToken.getApplicationToken().then((appToken) => {
      db.set('warcraft.access.bnetToken', appToken.data.access_token)
        .write()
    })
  }

  processCommand () {
    console.log('>>> processCommand :', this._arguments)
    switch (this._arguments[0]) {
      case 'profile':
        this.profileCommand(this._arguments, this._message)
        break
      case 'warcraft':
        // this.warcraftCommand(this._arguments, this._message)
        break
      default:
        this._message.channel.send(
          "I don't understand the command. Try `!help` or `!warcraft`"
        )
    }
  }

  profileCommand () {

    const wowOrigin = this._arguments[1]
    const wowRealm = this._arguments[2]
    const wowName = this._arguments[3]

    this._blizzardjs.wow
      .character(['stats', 'guild'], { origin: wowOrigin, realm: wowRealm, name: wowName })
      .then(response => {
        console.log(response.data.stats)
        // const allStats = response.data.statistics.subCategories
        // const allStatsLength = allStats.length
        // for (let index = 0; index < allStatsLength; index++) {
        //   const stats = allStats[index]
        //   console.log('>>> stats :', stats)
        // }
        this._message.channel.send(
          `${response.data.name}`
        )
      })
  }
}
