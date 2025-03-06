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