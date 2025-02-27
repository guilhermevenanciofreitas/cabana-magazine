import Sequelize from 'sequelize';

export class ProductOptionValue {

  product_option_value_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'product_option_value_id',
  }

  product_id = {
    type: Sequelize.INTEGER,
    field: 'product_id',
  }

  option_id = {
    type: Sequelize.INTEGER,
    field: 'option_id',
  }

  option_value_id = {
    type: Sequelize.INTEGER,
    field: 'option_value_id',
  }

}