import { Command } from 'discord.js-commando'

import WarcraftInit from '../../warcraft/index'

const initWarCraft = new WarcraftInit()

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
  const bfaRaidProgression = `Normal Kills : ${bossKills.normalKills}/${total}
  Heroix Kills : ${bossKills.heroicKills}/${total}
  Mythic Kills : ${bossKills.mythicKills}/${total}`
  const raidFieldFieldValue = {
    name: `${name} ${aotc === true ? '(AOTC)' : ''} :`,
    value: bfaRaidProgression,
    inline: true
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

const initEmbedProfile = async (datas, args) => {
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
  const filterSpec = datas.talents.filter((talent) => {
    if (talent.selected === true) {
      // filterSpec.spec.name
      // filterSpec.spec.role
      // filterSpec.spec.icon
      return talent
    }
  })[0]

  const getClassName = classIdList.filter((classid) => {
    if (classid.id === datas.class) {
      return classid
    }
  })[0]

  const embed = {
    color: 0x0099ff,
    author: {
      name: `${datas.name} - ${getClassName.name} ${filterSpec.spec.name} - ${datas.realm} - ${
        datas.items.averageItemLevelEquipped
      } / ${datas.items.averageItemLevel} ilvl`
    },
    thumbnail: {
      url: `http://render-${args.origin}.worldofwarcraft.com/character/${
        datas.thumbnail
      }`
    },
    fields: getRaidsAvancement(datas),
    timestamp: new Date(datas.lastModified),
    footer: {
      text: 'This profile are last modified on'
      // icon_url: 'https://i.imgur.com/wSTFkRM.png'
    }
  }

  return embed
}

const generateLinks = (args) => {
  const links = {
    name: 'Profile links',
    value: `https://worldofwarcraft.com/${args.origin}-${
      args.origin
    }/character/${args.realm}/${args.name}
    https://www.warcraftlogs.com/character/${args.origin}/${
      args.realm
    }/${args.name}`
  }

  return links
}

export default class WarcraftProfileCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profile',
      aliases: [],
      group: 'warcraft',
      memberName: 'profile',
      description: 'Get information about a Warcraft Profile',
      args: [
        // {
        //   key: 'subCommand',
        //   prompt: 'Do you want to search, add,remove or list current know profile ?',
        //   type: 'string'
        // },
        {
          key: 'name',
          prompt: 'Which personnage name are you search?',
          type: 'string'
        },
        {
          key: 'saison',
          prompt: 'Which Saison ?',
          type: 'string',
          default: '3'
        },
        {
          key: 'realm',
          prompt: 'On which server?',
          type: 'string',
          default: 'hyjal'
        },
        {
          key: 'origin',
          prompt: 'On which continent?',
          type: 'string',
          default: 'eu'
        }
      ]
    })
  }

  async run (msg, args) {
    const waitMsg = msg.reply('Getting profile can take some time, please wait !')

    initWarCraft.init().then(async warcraftApi => {
      const characterField = await this._getCharacterProfile(warcraftApi, waitMsg, args)

      if (characterField.response && characterField.response.status === 404) {
        return waitMsg.then(sentMessage => {
          return sentMessage.edit(`Sorry ${msg.author} nobody found, try again !`)
        })
      } else {
        const getInitEmbed = await initEmbedProfile(characterField.data, args)
        const mythicKeystoneField = await this._getKeystoneProfile(warcraftApi, msg, args)
        const links = await generateLinks(args)

        getInitEmbed.fields.push(links)
        getInitEmbed.fields.unshift(mythicKeystoneField)

        return waitMsg.then(sentMessage => {
          sentMessage.edit(`${msg.author} This is what we have found !`)
          return msg.embed(getInitEmbed)
        })
      }
    })
  }

  async _getCharacterProfile (warcraftApi, message, args) {

    const characterProfile = await warcraftApi.wow
      .character(['profile', 'talents', 'items', 'achievements', 'progression'], {
        origin: args.origin,
        realm: args.realm,
        name: args.name
      }).catch(error => {
        return error
      })
    // const getInitEmbed = await initEmbedProfile(characterProfile.data, args)

    // console.log('>>> characterProfile :', characterProfile.data.talents)

    return characterProfile
  }

  async _getKeystoneProfile (warcraftApi, message, args) {
    const keyStoneProfile = await warcraftApi.profile.mythicKeystoneProfile({ realm: args.realm, name: args.name, season: args.saison }).catch(error => {
      console.log('>>> error :', error.response.status)
      return 'N/A'
    })
    if (keyStoneProfile === 'N/A') {
      return {
        name: 'N/A',
        value: 'No Keystone for this Season'
      }
    }
    const fieldMythicKeystone = {
      name: `Saison ${args.saison} In-Time Mythics Keystones : `,
      value: ''
    }
    const getBestRuns = keyStoneProfile.data.best_runs.reduce((previous, current) => {
      if (current.is_completed_within_time === true) {
        previous.push(current)
      }
      return previous
    }, []).sort((a, b) => {
      if (a.keystone_level > b.keystone_level) {
        return -1
      } else {
        return 1
      }
    })

    getBestRuns.map((mythicRun) => {
      const mythicKeystoneList = `${mythicRun.dungeon.name} ${mythicRun.keystone_level}`
      fieldMythicKeystone.value += mythicKeystoneList + '\n'
    })

    return fieldMythicKeystone
  }
}
