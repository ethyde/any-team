import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  // SQLite only
  storage: './db.sqlite'
})

const Profile = sequelize.define('profile', {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  realm: {
    type: Sequelize.STRING
  },
  class: {
    type: Sequelize.STRING
  },
  firstRole: {
    type: Sequelize.STRING
  },
  secondRole: {
    type: Sequelize.STRING
  },
  raid: {
    type: Sequelize.BOOLEAN
  },
  mythic: {
    type: Sequelize.BOOLEAN
  },
  armory: {
    type: Sequelize.STRING
  },
  warcraftlog: {
    type: Sequelize.STRING
  },
  raiderio: {
    type: Sequelize.STRING
  }
})

export default Profile
