import Commando from 'discord.js-commando'
import path from 'path'

// import WarcraftInit from '../warcraft/index'
export default class DiscordInit {
  constructor (options = {}) {
    this._discordToken = options.discordToken
  }

  init () {
    const client = new Commando.Client({
      owner: '158633980135079937',
      commandPrefix: process.env.NODE_ENV === 'development' ? 'cdev' : '!at'
    })

    client.registry
      // Registers all built-in groups, commands, and argument types
      .registerDefaultTypes()
      .registerDefaultGroups({
        util: false,
        commands: false
      })
      .registerDefaultCommands({
        help: true,
        prefix: false,
        eval_: false,
        ping: false,
        commandState: false
      })

      // Registers your custom command groups
      .registerGroups([
        ['base', 'Not game related'],
        ['warcraft', 'World of Warcraft commands']
      ])

      // Registers all of your commands in the ./commands/ directory
      .registerCommandsIn(path.join(__dirname, '../commands'))

    client.on('ready', () => {
      console.log('Connected as ' + client.user.tag)
    })

    // Get your bot's secret token from:
    // https://discordapp.com/developers/applications/
    // Click on your application -> Bot -> Token -> "Click to Reveal Token"

    client.on('ready', () => {
      // List servers the bot is connected to
      console.log('Servers:')
      client.guilds.forEach(guild => {
        console.log(' - ' + guild.name)

        console.log('Channel:')
        // List all channels
        guild.channels.forEach(channel => {
          console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        })
      })

      // var generalChannel = client.channels.get('544102186234150936') // Replace with known channel ID
      // generalChannel.send('Hello, world!')
    })

    client.on('message', receivedMessage => {
      // Prevent bot from responding to its own messages
      if (receivedMessage.author === client.user) {
        return
      }

      // Check if the bot's user was tagged in the message
      if (receivedMessage.content.includes(client.user.toString())) {
        // Send acknowledgement message
        receivedMessage.channel.send(
          'Message received from ' +
            receivedMessage.author.toString() +
            ': ' +
            receivedMessage.content
        )
      }
    })

    client.on('error', console.error)

    client.login(this._discordToken)
  }
}
