import inquirer from 'inquirer'
// import jsonfile from 'jsonfile'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

import DiscordInit from './discord/index'

const adapter = new FileSync('data.json')
const db = low(adapter)

const askForToken = () => {
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
    .then(answers => {
      db.defaults({ discord: {}, warcraft: { access: {} } }).write()
      db.set('discord.token', answers.discordToken)
        .set('warcraft.access.bnetKey', answers.bnetKey)
        .set('warcraft.access.bnetSecret', answers.bnetSecret)
        .write()
      return answers
    })
}

function doOnInit () {
  const getDiscordToken = db.get('discord.token').value()

  const discord = new DiscordInit({
    discordToken: getDiscordToken
  })
  discord.init()
}

if (db.has('discord.token').value()) {
  console.log('Exist')
  doOnInit()
} else {
  console.log('Not Exist')
  askForToken().then(allAnswers => {
    console.log('>>> allAnswers :', allAnswers)
  })
}
