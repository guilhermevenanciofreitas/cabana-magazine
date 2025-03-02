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

export class Passo3Controller {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const { inicio, final, empresa } = req.body

        const db = new AppContext()
        const db2 = new AppContext2()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0

        const query = `
          select st.name status,cab.date_added dataped,det.order_product_id trans_det,det.order_id trans_cab,cab.customer_id,
		      det.product_id codprod,op1.product_option_value_id codprod1,convert(det.name,varchar(100)) descri1,det.model modelo,
          convert(op2.codigo_de_barra,varchar(16)) codbarra,convert(ds.name,varchar(100)) descricao,op2.option_id,op2.option_value_id,dstam.name tamanho,
          det.quantity qtde,det.price precounit,det.total total_item,cab.total total_venda,cab.custom_field cpf,00 codloja,
          convert(cab.payment_custom_field,varchar(50)) compl,tt.value frete,'S' separado,Space(20) codcaixa,pd.sku,Space(50) observacao,
          cab.payment_firstname nome1,cab.payment_lastname nome2,cab.payment_address_1 endereco,cab.payment_address_2 bairro,
          cab.payment_city cidade,cab.payment_zone uf,cab.payment_postcode cep,cab.order_status_id status_id,cab.email,cab.telephone fone
          from oc_order_product det,
          oc_order cab, oc_order_option op1, oc_product_option_value op2, oc_order_status st, oc_order_total tt, oc_product_description ds,
          oc_option_value_description dstam, oc_product pd
          where cab.order_id = det.order_id and op1.order_id = det.order_id and op1.order_product_id = det.order_product_id and
          op2.product_id = det.product_id and op2.product_option_value_id = op1.product_option_value_id and
          ds.product_id = det.product_id and dstam.option_id = op2.option_id and dstam.option_value_id = op2.option_value_id and
          st.order_status_id = cab.order_status_id and tt.order_id = cab.order_id and tt.code = 'shipping' and
          pd.product_id = det.product_id and
          cab.date_added BETWEEN '${inicio} 00:00' AND '${final} 23:59' and cab.order_status_id in (19,21)
        `

        const productOrders = await db.query(query, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const skill_cab_vendas = await db2.query(`SELECT numero, data, codprod, codprod1, separado, codloja FROM skill_cab_vendas WHERE data BETWEEN '${inicio}' AND '${final}' AND separado = 1 AND gerouxml = 0`, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const parceiro = await db2.query(`SELECT * FROM skill_cab_parceiro`, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const empresas = await db2.query(`
          SELECT loj_id codloja, UPPER(CONVERT(loj_nome,char(40))) empresa FROM lojas order by loj_id`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        let items = []

        for (var item of productOrders) {

          const cab_venda = _.filter(skill_cab_vendas, (item2) => item2.numero == item.trans_cab && dayjs(item2.data).format('YYYY-MM-DD') == dayjs(item.dataped).format('YYYY-MM-DD') && item2.codprod == item.codprod && item2.codprod1 == item.codprod1)
          
          if (_.size(cab_venda) > 0) {

            if (empresa?.loj_id && empresa?.loj_id != cab_venda[0]?.codloja) {
              continue
            }

            const parc = _.filter(parceiro, (parc) => parc.email == item.email?.split("@")[1])[0]

            const fat = _.filter(empresas, (parc) => parc.codloja == cab_venda[0].codloja)[0]

            items.push({...item, parc: parc, fat, codloja: cab_venda[0]?.codloja})

          }

        }

        items = _.filter(items, (item) => item?.status?.toUpperCase()?.includes('CONFIR'))

        res.status(200).json({
          request: {
            inicio, final, empresa, limit, offset
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

        const db = new AppContext2()
  
        await db.transaction(async (transaction) => {

          for (const item of req.body) {

            const { numero, codprod, codprod1, codcaixa, obs } = item
  
            await db.query(`UPDATE skill_cab_vendas SET separado = 1, codcaixa = ${codcaixa ?? 'NULL'}, observacao = '${obs ?? ''}', dtseparado = NOW() WHERE numero = ${numero} and codprod = ${codprod} and codprod1 = ${codprod1}`, {
              type: Sequelize.QueryTypes.UPDATE,
              transaction
            })
    
          }

        })

        res.status(200).json({})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}