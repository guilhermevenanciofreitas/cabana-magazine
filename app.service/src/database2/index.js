import { Sequelize } from 'sequelize'

import 'dotenv/config'

export class AppContext2 extends Sequelize {
  
  constructor() {

    super({
      host: process.env.DB_HOST2,
      port: process.env.DB_PORT2,
      database: process.env.DB_DATABASE2,
      username: process.env.DB_USER2,
      password: process.env.DB_PASSWORD2,
      dialect: 'mysql',
      timezone: "America/Sao_Paulo",
      define: { 
        timestamps: false, 
        freezeTableName: true
      }
    })

  }

}