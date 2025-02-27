import { Sequelize } from 'sequelize'
import tedious from 'tedious'

import 'dotenv/config'

export class AppContext2 extends Sequelize {
  
  constructor() {

    super({
      host: '167.172.255.32',  // Coloque o endereço do seu servidor MySQL
      port: 3306,         // A porta padrão do MySQL é 3306
      database: 'cabana_sistema', // Nome do banco de dados
      username: 'cabana_sistema',    // Seu usuário MySQL
      password: 'S0mc2nAFrZl@ux2k', // Sua senha MySQL
      dialect: 'mysql',    // Dialeto para MySQL
      timezone: "America/Sao_Paulo",
      define: { 
        timestamps: false, 
        freezeTableName: true // Garante que o nome da tabela seja o mesmo que o nome do modelo
      }
    })

  }

}