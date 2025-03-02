import { Sequelize } from 'sequelize'
import tedious from 'tedious'

import 'dotenv/config'

export class AppContext2 extends Sequelize {
  
  constructor() {

    super({
      host: '167.172.255.32',
      //host: '10.108.0.2',
      port: 3306,
      database: 'cabana_sistema',
      username: 'cabana_sistema',
      password: 'S0mc2nAFrZl@ux2k',
      dialect: 'mysql',
      timezone: "America/Sao_Paulo",
      define: { 
        timestamps: false, 
        freezeTableName: true // Garante que o nome da tabela seja o mesmo que o nome do modelo
      }
    })

  }

}