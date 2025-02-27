import Sequelize from 'sequelize';

export class Order {

  order_id = {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
  }

  date_added = {
    type: Sequelize.DATE,
    field: 'date_added',
  }

  customer_id = {
    type: Sequelize.INTEGER,
    field: 'customer_id',
  }

  total = {
    type: Sequelize.FLOAT,
    field: 'total',
  }

  custom_field = {
    type: Sequelize.STRING,
    field: 'custom_field',
  }

  payment_custom_field = {
    type: Sequelize.STRING,
    field: 'payment_custom_field',
  }

  payment_firstname = {
    type: Sequelize.STRING,
    field: 'payment_firstname',
  }

  payment_lastname = {
    type: Sequelize.STRING,
    field: 'payment_lastname',
  }

  payment_address_1 = {
    type: Sequelize.STRING,
    field: 'payment_address_1',
  }

  payment_address_2 = {
    type: Sequelize.STRING,
    field: 'payment_address_2',
  }

  payment_city = {
    type: Sequelize.STRING,
    field: 'payment_city',
  }

  payment_zone = {
    type: Sequelize.STRING,
    field: 'payment_zone',
  }

  payment_postcode = {
    type: Sequelize.STRING,
    field: 'payment_postcode',
  }

  email = {
    type: Sequelize.STRING,
    field: 'email',
  }

  telephone = {
    type: Sequelize.STRING,
    field: 'telephone',
  }

  order_status_id = {
    type: Sequelize.INTEGER,
    field: 'order_status_id',
  }

}