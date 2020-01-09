const classIdList = [
  { id: 1, name: 'Guerrier' },
  { id: 2, name: 'Paladin' },
  { id: 3, name: 'Chasseur' },
  { id: 4, name: 'Voleur' },
  { id: 5, name: 'Prêtre' },
  { id: 6, name: 'Chevalier de la Mort' },
  { id: 7, name: 'Chaman' },
  { id: 8, name: 'Mage' },
  { id: 9, name: 'Démoniste' },
  { id: 10, name: 'Moine' },
  { id: 11, name: 'Druide' },
  { id: 12, name: 'Chasseur de Démon' }
]

const getClassName = (classId) => {
  const getClassById = classIdList.filter((classid) => {
    if (classid.id === classId) {
      return classid
    }
  })[0]

  return getClassById
}

const currentSpec = (talents) => {
  const filterSpec = talents.filter((talent) => {
    if (talent.selected === true) {
      // filterSpec.spec.name
      // filterSpec.spec.role
      // filterSpec.spec.icon
      return talent
    }
  })[0]

  return filterSpec
}

const filterRaidAchievement = raids => {
  return raids.map(raid => {
    const raidDatas = {
      name: raid.name,
      totalBosses: raid.bosses.length,
      bosses: raid.bosses.reduce(
        (previous, current) => {
          if (current.normalKills >= 1) {
            previous.normalKills = previous.normalKills + 1
          }

          if (current.heroicKills >= 1) {
            previous.heroicKills = previous.heroicKills + 1
          }

          if (current.mythicKills >= 1) {
            previous.mythicKills = previous.mythicKills + 1
          }
          return previous
        },
        { normalKills: 0, heroicKills: 0, mythicKills: 0 }
      )
    }

    return raidDatas
  })
}

const buildRaidFieldValue = (name, bossKills, total, aotc) => {
  const raidFieldFieldValue = {
    name: `${name} `,
    normal: `${bossKills.normalKills}/${total}`,
    heroic: `${bossKills.heroicKills}/${total}`,
    mythic: `${bossKills.heroicKills}/${total}`
  }

  return raidFieldFieldValue
}

const getRaidsAvancement = (datas) => {
  const getLastRaids = datas.progression.raids.slice(-3)
  const isBfAAHeadCurve = datas.achievements.achievementsCompleted.indexOf(13322) > -1
  const isCoSAHeadCurve = datas.achievements.achievementsCompleted.indexOf(13418) > -1
  const isEPAHeadCurve = datas.achievements.achievementsCompleted.indexOf(13784) > -1
  const getRaidProgression = filterRaidAchievement(getLastRaids)
  const buildRaidsFields = []

  getRaidProgression.map((raid, index) => {
    if (raid.name === 'Bataille de Dazar’alor') {
      buildRaidsFields.push(buildRaidFieldValue(raid.name, raid.bosses, raid.totalBosses, isBfAAHeadCurve))
    }

    if (raid.name === 'Creuset des Tempêtes') {
      buildRaidsFields.push(buildRaidFieldValue(raid.name, raid.bosses, raid.totalBosses, isCoSAHeadCurve))
    }

    if (raid.name === 'Palais Éternel') {
      buildRaidsFields.push(buildRaidFieldValue(raid.name, raid.bosses, raid.totalBosses, isEPAHeadCurve))
    }
  })

  return buildRaidsFields
}

export class FormatProfile {
  constructor (config) {
    this.bnetAPi = config.warcraftApi
    this.arguments = config.args
    this.message = config.msg
  }

  init () {
    return this._formatProfile()
  }

  async _getProfile (api, args) {
    const characterProfile = await api.wow
      .character(['profile', 'talents', 'items', 'achievements', 'progression'], {
        origin: args.origin,
        realm: args.realm,
        name: args.name
      })
      .catch(error => {
        // console.log('>>> error :', error.response.data.reason)
        // return error
        return this.message.reply(`Erreur when try to add ${args.name} : ${error.response.data.reason}`)
      })

    return characterProfile
  }

  async _formatProfile () {
    const getProfileDatas = await this._getProfile(this.bnetAPi, this.arguments)

    const profile = {
      realm: this.arguments.realm,
      name: this.arguments.name,
      roster: false,
      thumb: `http://render-${this.arguments.origin}.worldofwarcraft.com/character/${
        getProfileDatas.data.thumbnail
      }`,
      class: getClassName(getProfileDatas.data.class).name,
      spec: currentSpec(getProfileDatas.data.talents).spec.name,
      role: currentSpec(getProfileDatas.data.talents).spec.role,
      roleIcon: `https://render-${this.arguments.origin}.worldofwarcraft.com/icons/18/${currentSpec(getProfileDatas.data.talents).spec.icon}.jpg`,
      ilvl: [
        getProfileDatas.data.items.averageItemLevelEquipped,
        getProfileDatas.data.items.averageItemLevel
      ],
      raid: getRaidsAvancement(getProfileDatas.data),
      achievementss: {
        aheadOfTheCurve: {
          bfa: getProfileDatas.data.achievements.achievementsCompleted.indexOf(13322) > -1,
          cos: getProfileDatas.data.achievements.achievementsCompleted.indexOf(13418) > -1,
          ep: getProfileDatas.data.achievements.achievementsCompleted.indexOf(13784) > -1
        },
        mythicKeyStone: {
          conquerant: getProfileDatas.data.achievements.achievementsCompleted.indexOf(13780) > -1,
          master: getProfileDatas.data.achievements.achievementsCompleted.indexOf(13781) > -1
        }
      }

    }

    return profile
  }
}
