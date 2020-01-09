import AsciiTable from 'ascii-table'

import { Command } from 'discord.js-commando'

import Profile from '../../helpers/dbProfile'
import WarcraftInit from '../../warcraft/index'
import { FormatProfile } from '../../warcraft/formatprofile'

const initWarCraft = new WarcraftInit()

const initRoster = () => {
  // return Roster.sync()
  // return Profile.sync({force: true})
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
          key: 'mainRole',
          prompt: 'Main Role of current char added to Roster ?',
          type: 'string',
          default: ''
        },
        {
          key: 'secondRole',
          prompt: 'Second Role of current char added to Roster ?',
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

    if (args.subCommand === 'add') {
      const currentProfile = await this._getProfile(args, msg)

      await Profile.findOrCreate(
        {
          where: {
            name: currentProfile.name
          },
          defaults: {
            name: currentProfile.name,
            realm: currentProfile.realm,
            class: currentProfile.class,
            firstRole: args.mainRole !== '' ? args.mainRole : currentProfile.role,
            secondRole: args.secondRole !== '' ? args.secondRole : '',
            armory: `https://worldofwarcraft.com/eu-eu/character/${args.realm}/${args.name}`,
            warcraftlog: `https://www.warcraftlogs.com/character/eu/${args.realm}/${args.name}`
          }
        })
        .then(response => {
          // console.log('>>> user, created :', response[0], response[1])
          if (response[1] === false) {
            return msg.reply(`${args.name} allready present !`)
          } else {
            return msg.reply(`${args.name} added !`)
          }
        })
    }

    if (args.subCommand === 'update') {
      const currentProfile = await this._getProfile(args, msg)
      await Profile.update({
        firstRole: args.mainRole !== '' ? args.mainRole : currentProfile.role,
        secondRole: args.secondRole !== '' ? args.secondRole : ''
      }, {
        where: {
          name: currentProfile.name
        }
      })
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
      const getDatas = await Profile.findAll()
      const currentRoster = new AsciiTable('AfterWork Current Roster')

      currentRoster
        .setHeading('', 'Nom', 'Classe', 'Main Role', 'Second Role')

      getDatas.map((profile, index) => {
        currentRoster.addRow(index + 1, profile.dataValues.name, profile.dataValues.class, profile.dataValues.firstRole, profile.dataValues.secondRole)
      })

      return msg.say('```' + currentRoster.toString() + '```')
    }

    // return msg.reply('hello !')
  }

  async _getProfile (args, msg) {
    const warcraftApi = await initWarCraft.init()
    const getProfile = new FormatProfile({ warcraftApi, args, msg })
    const profile = await getProfile.init()

    return profile
  }
}
