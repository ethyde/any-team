import Discord from 'discord.js'

import WarcraftInit from '../warcraft/index'

export default class DiscordInit {
  constructor (options = {}) {
    this._discordToken = options.discordToken
  }

  init () {
    const client = new Discord.Client()

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

      if (receivedMessage.content.startsWith('!')) {
        this.processCommand(receivedMessage)
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

  processCommand (receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(' ') // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let argumentsList = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    console.log('Command received: ' + primaryCommand)
    console.log('Arguments: ' + argumentsList) // There may not be any arguments

    switch (primaryCommand) {
      case 'help':
        this.helpCommand(argumentsList, receivedMessage)
        break
      case 'warcraft':
        this.warcraftCommand(argumentsList, receivedMessage)
        break
      default:
        receivedMessage.channel.send(
          "I don't understand the command. Try `!help` or `!warcraft`"
        )
    }
  }

  helpCommand (argumentsList, receivedMessage) {
    if (argumentsList.length > 0) {
      receivedMessage.channel.send(
        'It looks like you might need help with ' + argumentsList
      )
    } else {
      receivedMessage.channel.send(
        "I'm not sure what you need help with. Try `!help [topic]`"
      )
    }
  }

  warcraftCommand (argumentsList, receivedMessage) {
    const initWarCraft = new WarcraftInit({
      message: receivedMessage,
      arguments: argumentsList
    })

    console.log('>>> argumentsList :', argumentsList)
    initWarCraft.init()
  }
}
