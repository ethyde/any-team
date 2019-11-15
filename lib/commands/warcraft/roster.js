import AsciiTable from 'ascii-table'

import { Command } from 'discord.js-commando'

import Roster from '../../helpers/dbRoster'
import Profile from '../../helpers/dbProfile'
import WarcraftInit from '../../warcraft/index'
import { FormatProfile } from '../../warcraft/formatprofile'

const initWarCraft = new WarcraftInit()

const initRoster = () => {
  // return Roster.sync()
  return Profile.sync()
}

export default class OtherCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'roster',
      hidden: true,
      aliases: [],
      group: 'warcraft',
      memberName: 'roster',
      description: 'Manage Roster List',
      args: [
        {
          key: 'subCommand',
          prompt: 'Do you want to add,remove or list current Roster ?',
          type: 'string'
        },
        {
          key: 'name',
          prompt: 'name to add to your current Roster ?',
          type: 'string',
          default: ''
        },
        {
          key: 'realm',
          prompt: 'Realm where are the charactere',
          type: 'string',
          default: 'Hyjal'
        }
      ]
    })
  }

  async run (msg, args) {
    await initRoster()
    // const channel = args.channel
    // console.log('>>> msg, args :', msg, args)
    // return msg.reply(`${channel.name} (${channel.id})`)
    console.log('>>> args :', args)
    console.log('>>> subCommand :', args.subCommand)
    console.log('>>> name :', args.name)
    if (args.subCommand === 'add') {
      const currentProfile = await this._getProfile(args)
      // console.log('>>> currentProfile :', currentProfile)
      await Profile.findOrCreate(
        {
          where: {
            name: currentProfile.name
          },
          defaults: {
            name: currentProfile.name,
            realm: currentProfile.realm,
            firstRole: currentProfile.role,
            secondRole: args.secondRole !== undefined ? args.secondRole : '',
            armory: `https://worldofwarcraft.com/eu-eu/character/${args.realm}/${args.name}`,
            warcraftlog: `https://www.warcraftlogs.com/character/eu/${args.realm}/${args.name}`
          }
        })
        .then(response => {
          console.log('>>> user, created :', response[0], response[1])
          if (response[1] === false) {
            return msg.reply(`${args.name} allready added !`)
          }
        })
      return msg.reply('added !')
    }

    if (args.subCommand === 'remove') {
      await Profile.destroy({
        where: {
          name: args.name
        }
      })
      return msg.reply(`${args.name} removed from DB !`)
    }

    if (args.subCommand === 'list') {
      const getDatas = await Roster.findAll()
      const currentRoster = new AsciiTable('AfterWork Current Roster')
      console.log('>>> getDatas :', getDatas)
      currentRoster
        .setHeading('', 'name', 'Rôle', 'Serveur', 'Armory', 'Warcraftlog')
        .addRow(1, 'Bob', 'Heal', 'Hyjal', 'Armory', 'Warcraftlog')

      return msg.say('```' + currentRoster.toString() + '```')
    }

    return msg.reply('hello !')
  }

  async _getProfile (args) {
    const warcraftApi = await initWarCraft.init()
    const getProfile = new FormatProfile({ warcraftApi, args })
    const profile = await getProfile.init()

    return profile
  }
}
