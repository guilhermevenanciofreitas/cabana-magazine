import Sequelize from 'sequelize';

export class ProductDescription {

  option_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'option_id',
  }
  
  option_value_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'option_value_id',
  }

  name = {
    type: Sequelize.STRING,
    field: 'name',
  }

}