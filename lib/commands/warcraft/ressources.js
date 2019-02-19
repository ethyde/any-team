import { Command } from 'discord.js-commando'

import low from 'lowdb'
import FileAsync from 'lowdb/adapters/FileAsync'

import AsciiTable from 'ascii-table'

const adapter = new FileAsync('data.json')

export default class WarcraftRessourcesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ressources',
      aliases: [],
      group: 'warcraft',
      memberName: 'ressources',
      description: 'Get information about needed ressources and reagents',
      details: 'You can use sub-command like add, remove, update or list. Reagent are case sensitive and must be in french.',
      examples: ['ressources add Ancoracée 50', 'ressources remove Ancoracée 50'],
      args: [
        {
          key: 'subCommand',
          prompt: 'SubCommand you can use to update ressources counts',
          type: 'string'
        },
        {
          key: 'reagent',
          prompt: 'Reagent name you want to modify',
          type: 'string',
          default: ''
        },
        {
          key: 'quantity',
          prompt: 'Reagent quantity you want to modify',
          type: 'float',
          default: 0
        }
      ]
    })
  }

  async run (msg, args) {
    low(adapter).then(db => {
      const getReagentEntry = db.get(`warcraft.recipes.chaudron`)
      console.log('>>> args :', args)
      // console.log('>>> msg :', msg)
      if (args.subCommand === 'add') {
        const getReagentEntryByName = getReagentEntry.find({
          reagentName: args.reagent
        })
        const getCurrentValue = getReagentEntryByName.value()

        getReagentEntryByName
          .assign({
            currentValue: getCurrentValue.currentValue + args.quantity
          })
          .write()
      }

      if (args.subCommand === 'remove') {
        const getReagentEntryByName = getReagentEntry.find({
          reagentName: args.reagent
        })
        const getCurrentValue = getReagentEntryByName.value()
        const finalQuantity = getCurrentValue.currentValue - args.quantity

        getReagentEntryByName
          .assign({
            currentValue: finalQuantity
          })
          .write()

        msg.say(`You have retired ${args.quantity} of ${args.reagent} from the bank, there are ${finalQuantity} left`)

        if (finalQuantity < getCurrentValue.minimalValue && finalQuantity > 0) {
          return msg.say(`Beware you are under the minimal quantity of ${getCurrentValue.minimalValue} for ${args.reagent}`)
        } else if (finalQuantity <= 0) {
          return msg.say(`Beware you are under 0 for ${args.reagent}`)
        }
      }

      if (args.subCommand === 'update') {
        const getReagentEntryByName = getReagentEntry.find({
          reagentName: args.reagent
        })

        getReagentEntryByName
          .assign({ currentValue: args.quantity })
          .write()
      }

      if (args.subCommand === 'list') {
        const getCurrentValue = getReagentEntry.value()
        let table = new AsciiTable('Chaudron')
        let reagentTable = ''
        let reagentSummary = ''
        let availablePerReagent = []

        table.setHeading('', 'Composant', 'Minimum', 'Actuel')

        getCurrentValue.forEach(reagentDatas => {
          table = table.addRow(
            reagentDatas.reagentName,
            reagentDatas.minimalValue,
            reagentDatas.currentValue
          )
          if (
            reagentDatas.currentValue < reagentDatas.minimalValue
          ) {
            reagentSummary +=
              'Pas assez de **' +
              reagentDatas.reagentName +
              '** pour faire un chaudron\n'
          } else {
            availablePerReagent.push(
              reagentDatas.currentValue /
              reagentDatas.minimalValue
            )
          }
        })

        reagentTable = table.toString()

        if (availablePerReagent.length === getCurrentValue.length) {
          const min = availablePerReagent.reduce((prev, current) =>
            prev < current ? prev : current
          )
          reagentSummary +=
            'Vous pouvez faire **' + Math.floor(min) + '** chaudron(s)'
        }

        return msg.say('```' + reagentTable + '```' + reagentSummary)
      }
    })
  }
}
