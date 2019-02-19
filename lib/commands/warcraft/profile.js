import { Command } from 'discord.js-commando'
import AsciiTable from 'ascii-table'

import WarcraftInit from '../../warcraft/index'

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

    initWarCraft.init().then(warcraftApi => {
      warcraftApi.wow
        .character(['stats', 'guild'], {
          origin: args.origin,
          realm: args.realm,
          name: args.name
        })
        .then(response => {
          let table = new AsciiTable('Fiche')

          const getProfileLink =
            'For more information about ' +
            args.name.charAt(0).toUpperCase() +
            args.name.slice(1) +
            ' from ' +
            args.realm.charAt(0).toUpperCase() +
            args.realm.slice(1) +
            '-' +
            args.origin +
            '\n' +
            'WoW Armory : https://worldofwarcraft.com/' +
            args.origin +
            '-' +
            args.origin +
            '/character/' +
            args.realm +
            '/' +
            args.name +
            ')\n' +
            'If available WarcraftLog : (https://www.warcraftlogs.com/character/' +
            args.origin +
            '/' +
            args.realm +
            '/' +
            args.name +
            ')'

          table
            .addRow('Name', response.data.name)
            .addRow('Server', response.data.realm)
            .addRow('Guild', response.data.guild.name)
            .addRow('Health', response.data.stats.health)
            .addRow('Force', response.data.stats.str)
            .addRow('Agility', response.data.stats.agi)
            .addRow('Intel', response.data.stats.int)
            .addRow('Stamina', response.data.stats.sta)
            .addRow('Crit', response.data.stats.crit)
            .addRow('Haste', response.data.stats.haste)
            .addRow('Mastery', response.data.stats.mastery)
            .addRow('Versality', response.data.stats.versatility)
            .addRow('Leech', response.data.stats.leech)

          return msg.say('```' + table + '```' + getProfileLink)
        })
    })
  }
}
