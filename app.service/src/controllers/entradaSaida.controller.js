import { AppContext } from "../database/index.js"
import { Authorization } from "./authorization/authorization.js"
import { formidable } from 'formidable'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { fileURLToPath } from 'url'
import xml2js from 'xml2js'
import dayjs from "dayjs"
import Sequelize from "sequelize"
//import axios from 'axios'

import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Exception } from "../utils/exception.js"

import sql from 'mssql'
import { AppContext2 } from "../database2/index.js"

export class EntradaSaidaController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const { inicio, final, empresa } = req.body

        const db = new AppContext()
        const db2 = new AppContext2()

        const search = req.body.search
        const filter = req.body.filter
        const limit = req.body.limit || 50
        const offset = req.body.offset || 0

        const where = []

        /*
        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        */
        /*
        const orders = await db.OrderProduct.findAndCountAll({
          attributes: [
            //[Sequelize.col('orderStatus.name'), 'status'],
            //[Sequelize.col('orderProduct.order_product_id'), 'trans_det'],
            //[Sequelize.col('orderProduct.order_id'), 'trans_cab'],
            [Sequelize.col('orderProduct.product_id'), 'codprod'],
            //[Sequelize.col('orderOption.product_option_value_id'), 'codprod1'],
            //[Sequelize.fn('CONVERT', Sequelize.col('OrderProduct.name'), 'VARCHAR(100)'), 'descri1'],
            //[Sequelize.col('orderProduct.model'), 'modelo'],
            //[Sequelize.fn('CONVERT', Sequelize.col('ProductOptionValue.codigo_de_barra'), 'VARCHAR(16)'), 'codbarra'],
            //[Sequelize.fn('CONVERT', Sequelize.col('ProductDescription.name'), 'VARCHAR(100)'), 'descricao'],
            //[Sequelize.col('ProductOptionValue.option_id'), 'option_id'],
            //[Sequelize.col('ProductOptionValue.option_value_id'), 'option_value_id'],
            //[Sequelize.col('OptionValueDescription.name'), 'tamanho'],
            [Sequelize.col('orderProduct.quantity'), 'qtde'],
            [Sequelize.col('orderProduct.price'), 'precounit'],
            [Sequelize.col('orderProduct.total'), 'total_item'],
            //[Sequelize.col('total'), 'total_venda'],
            //[Sequelize.col('custom_field'), 'cpf'],
            //[Sequelize.fn('CONVERT', Sequelize.col('payment_custom_field'), 'VARCHAR(50)'), 'compl'],
            //[Sequelize.col('OrderTotal.value'), 'frete'],
            //[Sequelize.literal("'S'"), 'separado'],
            //[Sequelize.literal("'     '"), 'estoq'],
            //[Sequelize.col('telephone'), 'fone'],
          ],
          include: [
            {model: db.Order, as: 'order', attributes: ['date_added', 'customer_id', 'payment_firstname', 'payment_lastname', 'payment_address_1', 'payment_address_2', 'payment_city', 'payment_zone', 'payment_postcode', 'order_status_id', 'email']}
          ],
          limit: limit,
          offset: offset * limit,
          where: {
            '$order.date_added$': {
              [Sequelize.Op.between]: ['2025-02-13', '2025-02-23']
            },
            '$order.order_status_id$': 19
          }
        })
        */

        let whereFiltro = ''

        if (filter?.cliente) {
          whereFiltro += ` AND (cab.payment_firstname LIKE '%${filter.cliente.replace(' ', '%')}%' OR cab.payment_lastname LIKE '%${filter.cliente.replace(' ', '%')}%') `
        }

        if (filter?.numero) {
          whereFiltro += ` AND (det.order_id LIKE '%${filter.numero.replace(' ', '%')}%') `
        }

        if (filter?.cpf) {
          whereFiltro += ` AND (cab.custom_field LIKE '%${filter.cpf.replace(' ', '%')}%') `
        }

        if (filter?.codbarra) {
          whereFiltro += ` AND (op2.codigo_de_barra LIKE '%${filter.codbarra.replace(' ', '%')}%') `
        }

        const query = `
          SELECT 
            st.name AS status,
            cab.date_added AS dataped,
            det.order_product_id AS trans_det,
            det.order_id AS trans_cab,
            cab.customer_id,
            det.product_id AS codprod,
            op1.product_option_value_id AS codprod1,
            CONVERT(det.name, VARCHAR(100)) AS descri1,
            det.model AS modelo,
            CONVERT(op2.codigo_de_barra, VARCHAR(16)) AS codbarra,
            CONVERT(ds.name, VARCHAR(100)) AS descricao,
            op2.option_id,
            op2.option_value_id,
            dstam.name AS tamanho,
            det.quantity AS qtde,
            det.price AS precounit,
            det.total AS total_item,
            cab.total AS total_venda,
            cab.custom_field AS cpf,
            CONVERT(cab.payment_custom_field, VARCHAR(50)) AS compl,
            tt.value AS frete,
            'S' AS separado,
            '     ' AS estoq,
            cab.payment_firstname AS nome1,
            cab.payment_lastname AS nome2,
            cab.payment_address_1 AS endereco,
            cab.payment_address_2 AS bairro,
            cab.payment_city AS cidade,
            cab.payment_zone AS uf,
            cab.payment_postcode AS cep,
            cab.order_status_id AS status1,
            cab.email,
            cab.telephone AS fone
          FROM oc_order_product det
          LEFT JOIN oc_order cab ON cab.order_id = det.order_id
          LEFT JOIN oc_order_option op1 ON op1.order_id = det.order_id AND op1.order_product_id = det.order_product_id
          LEFT JOIN oc_product_option_value op2 ON op2.product_id = det.product_id AND op2.product_option_value_id = op1.product_option_value_id
          LEFT JOIN oc_order_status st ON st.order_status_id = cab.order_status_id
          LEFT JOIN oc_order_total tt ON tt.order_id = cab.order_id AND tt.code = 'shipping'
          LEFT JOIN oc_product_description ds ON ds.product_id = det.product_id
          LEFT JOIN oc_option_value_description dstam ON dstam.option_id = op2.option_id AND dstam.option_value_id = op2.option_value_id
          WHERE 
            cab.date_added BETWEEN '${inicio} 00:00' AND '${final} 23:59'
            AND cab.order_status_id = 19
            ${whereFiltro}
        `;

        const productOrders = await db.query(query, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const orders = await db2.query(`SELECT numero, data, codprod, codprod1, separado, codloja FROM skill_cab_vendas WHERE data BETWEEN '${inicio}' AND '${final}' AND separado = 0`, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const parceiro = await db2.query(`SELECT * FROM skill_cab_parceiro`, {
          type: Sequelize.QueryTypes.SELECT,
        })

        let items = []

        for (var item of productOrders) {

          const cab_venda = _.filter(orders, (item2) => item2.numero == item.trans_cab && item2.data == dayjs(item.dataped).format('YYYY-MM-DD') && item2.codprod == item.codprod && item2.codprod1 == item.codprod1)
          
          if (_.size(cab_venda) > 0) {

            if (empresa?.loj_id && empresa?.loj_id != cab_venda[0]?.codloja) {
              continue
            }

            const parc = _.filter(parceiro, (parc) => parc.email == item.email?.split("@")[1])

            items.push({...item, parc: parc[0], codloja: cab_venda[0]?.codloja, separado: 'N'})

          }

        }

        items = _.filter(items, (item) => item.status?.toUpperCase()?.includes('CONFIR'))

        if (filter?.apenasMercadoLivre) {
          items = _.filter(items, (item) => item.parc?.parceiro?.toUpperCase()?.includes('MERCADO LIBRE'))
        }
        else {
          items = _.filter(items, (item) => item.parc?.parceiro?.toUpperCase()?.includes(filter?.parceiro) && !item.parc?.parceiro?.toUpperCase()?.includes('MERCADO LIBRE'))
        }
        
        res.status(200).json({
          request: {
            inicio, final, empresa, filter, limit, offset
          },
          response: {
            rows: items, count: items.length,//rows: orders.rows, count: orders.count
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  salvar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        for (const item of req.body) {

          const { numero, codprod, codprod1, codcaixa, obs } = item

          const db = new AppContext2()
  
          await db.query(`UPDATE skill_cab_vendas SET separado = 1, codcaixa = ${codcaixa ?? 'NULL'}, observacao = '${obs ?? ''}', dtseparado = NOW() WHERE numero = ${numero} and codprod = ${codprod} and codprod1 = ${codprod1}`, {
            type: Sequelize.QueryTypes.UPDATE,
          })
  
        }

        res.status(200).json({})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}