import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: './db.sqlite'
})

const Roster = sequelize.define('roster', {
  memberID: {
    type: Sequelize.STRING,
    unique: true
  }
})

export default Roster
