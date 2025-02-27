import Sequelize from 'sequelize';

export class OrderProduct {

  order_product_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: 'order_product_id',
  }

  order_id = {
    type: Sequelize.INTEGER,
    field: 'order_id',
  }

  product_id = {
    type: Sequelize.INTEGER,
    field: 'product_id',
  }

  quantity = {
    type: Sequelize.INTEGER,
    field: 'quantity',
  }

  price = {
    type: Sequelize.FLOAT,
    field: 'price',
  }

  total = {
    type: Sequelize.FLOAT,
    field: 'total',
  }

  name = {
    type: Sequelize.STRING,
    field: 'name',
  }

  model = {
    type: Sequelize.STRING,
    field: 'model',
  }

}