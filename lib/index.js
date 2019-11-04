import inquirer from 'inquirer'

import DiscordInit from './discord/index'
import Tokens from './helpers/dbTokens'

const askForToken = () => {
  console.log('Inquirer')
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'discordToken',
        message: 'You need a discord token'
      },
      {
        type: 'input',
        name: 'bnetKey',
        message: 'You need a BNet Key'
      },
      {
        type: 'input',
        name: 'bnetSecret',
        message: 'You need a BNet Secret'
      }
    ])
}

function doOnInit (discordToken) {
  const discord = new DiscordInit({
    discordToken: discordToken
  })
  discord.init()
}

const initBot = async () => {
  Tokens.sync().then(async () => {
    const getCount = await Tokens.count({ where: { name: 'discordToken' } })
    if (getCount === 0) {
      const getAnswer = await askForToken()

      for (const key in getAnswer) {
        const answer = getAnswer[key]
        await Tokens.create({
          name: key,
          token: answer
        })
      }
    }
  }).then(async () => {
    const discordToken = await Tokens.findOne({ where: { name: 'discordToken' } })

    doOnInit(discordToken.token)
  })
}

initBot()
