import { Command } from 'discord.js-commando'
import AsciiTable from 'ascii-table'

import WarcraftInit from '../../warcraft/index'

const filterRaidAchievement = raids => {
  return raids.map(raid => {
    let raidDatas = {
      name: raid.name,
      totalBosses: raid.bosses.length,
      bosses: raid.bosses.reduce(
        (previous, current) => {
          if (current.normalKills >= 1) {
            previous[0] = previous[0] + 1
          }
          if (current.heroicKills >= 1) {
            previous[1] = previous[1] + 1
          }
          if (current.mythicKills >= 1) {
            previous[2] = previous[2] + 1
          }
          return previous
        },
        [0, 0, 0]
      )
    }

    return raidDatas
  })
}

const formatRaidBossesAchievement = datas => {
  const getLastRaids = datas.progression.raids.slice(-3)
  const filterRaidsBosses = filterRaidAchievement(getLastRaids)
  let raids = []

  filterRaidsBosses.map(raid => {
    let raidObject = {
      name: raid.name,
      value: '==========',
      inline: false
    }

    raids.push(raidObject)
    raid.bosses.map((bosses, index) => {
      let bossesObject = {
        name: '',
        value: '',
        inline: true
      }
      if (bosses === raid.totalBosses) {
        if (index === 0) {
          bossesObject.name = 'Normal'
          bossesObject.value = ':white_check_mark:'
          raids.push(bossesObject)
        }
        if (index === 1) {
          bossesObject.name = 'Heroic'
          bossesObject.value = ':white_check_mark:'
          raids.push(bossesObject)
        }
        if (index === 2) {
          bossesObject.name = 'Mythic'
          bossesObject.value = ':white_check_mark:'
          raids.push(bossesObject)
        }
      } else {
        if (index === 0) {
          bossesObject.name = 'Normal'
          bossesObject.value = ':negative_squared_cross_mark:'
          raids.push(bossesObject)
        }
        if (index === 1) {
          bossesObject.name = 'Heroic'
          bossesObject.value = ':negative_squared_cross_mark:'
          raids.push(bossesObject)
        }
        if (index === 2) {
          bossesObject.name = 'Mythic'
          bossesObject.value = ':negative_squared_cross_mark:'
          raids.push(bossesObject)
        }
      }
    })
  })

  return raids
}

const generateTable = (title, heading, content) => {
  const table = new AsciiTable(title)
  table
    .setHeading(heading)
    .addRow(content)

  return table.toString()
}

const generateEmbedProfile = (datas, args) => {
  return new Promise((resolve, reject) => {
    const embedProfile = {
      color: 0x0099ff,
      // title: 'Some title',
      // url: 'https://discord.js.org',
      author: {
        name: `${datas.name} - ${datas.realm} - ${datas.items.averageItemLevelEquipped} / ${datas.items.averageItemLevel} ilvl`,
        icon_url: `http://render-${args.origin}.worldofwarcraft.com/character/${
          datas.thumbnail
        }`,
        url: `https://worldofwarcraft.com/${args.origin}-${
          args.origin
        }/character/${args.realm}/${args.name}`
      },
      description: '```' + generateTable('Primary Stats', ['Agility', 'Force', 'Stamina', 'Inteligence'], [`${datas.stats.agi}`, `${datas.stats.str}`, `${datas.stats.sta}`, `${datas.stats.int}`]) + '```' + '```' + generateTable('Secondary Stats', ['Crit', 'Haste', 'Mastery', 'Vers'], [`${datas.stats.crit}`, `${datas.stats.haste}`, `${datas.stats.mastery}`, `${datas.stats.versatility}`]) + '```\n',
      // thumbnail: {
      //   url: `http://render-${args.origin}.worldofwarcraft.com/character/${datas.thumbnail}`
      // },
      fields: [
        {
          name: '\u200b',
          value: '\u200b'
        }
      ],
      // image: {
      //   url: 'https://i.imgur.com/wSTFkRM.png'
      // },
      timestamp: new Date(datas.lastModified),
      footer: {
        text: 'This profile are last modified on'
        // icon_url: 'https://i.imgur.com/wSTFkRM.png'
      }
    }

    const raidAchievement = formatRaidBossesAchievement(datas)

    Array.prototype.push.apply(embedProfile.fields, raidAchievement)

    embedProfile.fields.push({
      name: '\u200b',
      value: '\u200b'
    },
    {
      name: 'WoW Armory',
      value: `https://worldofwarcraft.com/${args.origin}-${
        args.origin
      }/character/${args.realm}/${args.name}`,
      inline: true
    },
    {
      name: 'Warcraftlog',
      value: `https://www.warcraftlogs.com/character/${args.origin}/${
        args.realm
      }/${args.name}`,
      inline: true
    },
    {
      name: '\u200b',
      value: '\u200b'
    })

    resolve(embedProfile)
  })
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
        {
          key: 'name',
          prompt: 'Which name are you search?',
          type: 'string'
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
    const initWarCraft = new WarcraftInit()

    let waitMsg = msg.reply('Getting profile can take some time, please wait !')

    initWarCraft.init().then(warcraftApi => {
      warcraftApi.wow
        .character(['stats', 'items', 'progression', 'guild'], {
          origin: args.origin,
          realm: args.realm,
          name: args.name
        })
        .then(async response => {

          const profile = await generateEmbedProfile(response.data, args)
          await msg.embed(profile)

          return waitMsg.then(sentMessage => sentMessage.edit(`${msg.author} This is what we have found !`))
        })
    })
  }
}
