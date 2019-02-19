import inquirer from 'inquirer'
import low from 'lowdb'
import FileAsync from 'lowdb/adapters/FileAsync'

import DiscordInit from './discord/index'

const adapter = new FileAsync('data.json')

const askForToken = (db) => {
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
    .then(answers => {
      console.log('>>> answers :', answers)
      return db.defaults({
        discord: {
          token: answers.discordToken
        },
        warcraft: {
          access: {
            bnetKey: answers.bnetKey,
            bnetSecret: answers.bnetSecret
          },
          recipes: {
            chaudron: [
              {
                reagentName: 'Ancoracée',
                minimalValue: 60,
                currentValue: 0
              },
              {
                reagentName: "Mâche d'Akunda",
                minimalValue: 60,
                currentValue: 0
              },
              {
                reagentName: "Bise d'Hiver",
                minimalValue: 60,
                currentValue: 0
              },
              {
                reagentName: 'Brin-de-Mer',
                minimalValue: 45,
                currentValue: 0
              },
              {
                reagentName: 'Rivebulbe',
                minimalValue: 45,
                currentValue: 0
              },
              {
                reagentName: 'Pollen de sirène',
                minimalValue: 45,
                currentValue: 0
              },
              {
                reagentName: 'Mousse étoillée',
                minimalValue: 45,
                currentValue: 0
              }
            ]
          }
        }
      }).write()
    })
}

function doOnInit (db) {
  const getDiscordToken = db.get('discord.token').value()

  const discord = new DiscordInit({
    discordToken: getDiscordToken
  })
  discord.init()
}

low(adapter).then(async (db) => {
  if (db.has('discord.token').value()) {
    console.log('Exist')
    await doOnInit(db)
  } else {
    console.log('Not Exist')
    await askForToken(db)
    await doOnInit(db)
  }
})
