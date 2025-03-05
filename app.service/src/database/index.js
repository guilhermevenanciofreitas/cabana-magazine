import { Sequelize } from 'sequelize'

import 'dotenv/config'

export class AppContext extends Sequelize {
  
  constructor() {

    super({
      host: process.env.DB_HOST1,
      port: process.env.DB_PORT1,
      database: process.env.DB_DATABASE1,
      username: process.env.DB_USER1,
      password: process.env.DB_PASSWORD1,
      dialect: 'mysql',
      timezone: "America/Sao_Paulo",
      define: { 
        timestamps: false, 
        freezeTableName: true
      }
    })

  }

}