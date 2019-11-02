import { Command } from 'discord.js-commando'

export default class OtherCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'other',
      aliases: [],
      group: 'base',
      memberName: 'other',
      description: 'Get information about a Warcraft Profile'
    })
  }

  async run (msg, args) {
    // const channel = args.channel
    // console.log('>>> msg, args :', msg, args)
    // return msg.reply(`${channel.name} (${channel.id})`)
    return msg.reply('hello !')
  }
}
