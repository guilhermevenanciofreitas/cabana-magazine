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
      timezone: '-03:00', // Define o fuso horário (Exemplo: Brasília -03:00)
      dialectOptions: {
        timezone: 'local', // Garante que o MySQL use o fuso horário local
      },
      define: { 
        timestamps: false, 
        freezeTableName: true
      }
    })

  }

}