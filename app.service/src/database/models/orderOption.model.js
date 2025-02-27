import Sequelize from 'sequelize';

export class OrderOption {

  order_option_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'order_option_id',
  }

  order_product_id = {
    type: Sequelize.INTEGER,
    field: 'order_product_id',
  }

  product_option_value_id = {
    type: Sequelize.INTEGER,
    field: 'product_option_value_id',
  }

}