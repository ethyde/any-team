import inquirer from 'inquirer'

import Tokens from './helpers/dbTokens'

const askForBlizzardToken = () => {
  console.log('Inquirer')
  return inquirer
    .prompt([
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

const initBot = async () => {
  Tokens.sync().then(async () => {
    const getAnswer = await askForBlizzardToken()

    await Tokens.update({ token: getAnswer.bnetKey }, { where: { name: 'bnetKey' } })
    await Tokens.update({ token: getAnswer.bnetSecret }, { where: { name: 'bnetSecret' } })

  }).then(async () => {
  })
}

initBot()
