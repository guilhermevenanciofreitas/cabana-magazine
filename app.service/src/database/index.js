import { Sequelize } from 'sequelize'
import tedious from 'tedious'

import { OptionValueDescription } from './models/optionValueDescription.model.js'
import { Order } from './models/order.model.js'
import { OrderOption } from './models/orderOption.model.js'
import { OrderProduct } from './models/orderProduct.model.js'
import { OrderStatus } from './models/orderStatus.model.js'
import { OrderTotal } from './models/orderTotal.model.js'
import { ProductDescription } from './models/productDescription.model.js'
import { ProductOptionValue } from './models/productOptionValue.model.js'

import 'dotenv/config'

export class AppContext extends Sequelize {
  
  OptionValueDescription = this.define('optionValueDescription', new OptionValueDescription(), { tableName: 'oc_option_value_description' })

  Order = this.define('order', new Order(), { tableName: 'oc_order' })

  OrderOption = this.define('orderOption', new OrderOption(), { tableName: 'oc_order_option' })

  OrderProduct = this.define('orderProduct', new OrderProduct(), { tableName: 'oc_order_product' })

  OrderStatus = this.define('orderStatus', new OrderStatus(), { tableName: 'oc_order_status' })

  OrderTotal = this.define('orderTotal', new OrderTotal(), { tableName: 'oc_order_total' })

  ProductDescription = this.define('productDescription', new ProductDescription(), { tableName: 'oc_product_description' })

  ProductOptionValue = this.define('productOptionValue', new ProductOptionValue(), { tableName: 'oc_product_option_value' })

  constructor() {

    super({
      host: '167.172.255.32',  // Coloque o endereço do seu servidor MySQL
      port: 3306,         // A porta padrão do MySQL é 3306
      database: 'cabana_loja', // Nome do banco de dados
      username: 'cabana_loja',    // Seu usuário MySQL
      password: 'hY3TfP2065vkNsN7', // Sua senha MySQL
      dialect: 'mysql',    // Dialeto para MySQL
      timezone: "America/Sao_Paulo",
      define: { 
        timestamps: false, 
        freezeTableName: true // Garante que o nome da tabela seja o mesmo que o nome do modelo
      }
    })

    this.OrderProduct.belongsTo(this.Order, {as: 'order', foreignKey: 'order_id', targetKey: 'order_id'})

    //this.OrderProduct.hasMany(this.OrderOption, { foreignKey: 'order_product_id' });
    //this.OrderOption.belongsTo(this.OrderProduct, { foreignKey: 'order_product_id' });

    //this.OrderOption.hasMany(this.ProductOptionValue, { foreignKey: 'product_option_value_id' });
    //this.ProductOptionValue.belongsTo(this.OrderOption, { foreignKey: 'product_option_value_id' });

    //this.Order.hasMany(this.OrderStatus, { as: 'orderStatus', foreignKey: 'order_status_id' });
    //this.OrderStatus.belongsTo(this.Order, { foreignKey: 'order_status_id' });

    //this.Order.hasMany(this.OrderTotal, { foreignKey: 'order_id' });
    //this.OrderTotal.belongsTo(this.Order, { foreignKey: 'order_id' });

    //this.OrderProduct.belongsTo(this.ProductDescription, { foreignKey: 'product_id' });
    //this.ProductDescription.hasMany(this.OrderProduct, { foreignKey: 'product_id' });

    //this.ProductOptionValue.belongsTo(this.OptionValueDescription, { foreignKey: 'option_value_id' });
    //this.OptionValueDescription.hasMany(this.ProductOptionValue, { foreignKey: 'option_value_id' });
    

  }

}