import Sequelize from 'sequelize';

export class OrderStatus {

  order_total_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'order_total_id',
  }

  order_id = {
    type: Sequelize.INTEGER,
    field: 'order_id',
  }

  code = {
    type: Sequelize.STRING,
    field: 'code',
  }

  value = {
    type: Sequelize.FLOAT,
    field: 'value',
  }

}