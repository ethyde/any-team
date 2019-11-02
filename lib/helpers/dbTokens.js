import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: './db.sqlite'
})

const Tokens = sequelize.define('tokens', {
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  token: {
    type: Sequelize.STRING
  }
})

export default Tokens
