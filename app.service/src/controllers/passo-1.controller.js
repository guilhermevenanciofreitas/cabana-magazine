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
import { Report } from "../reports/index.js"

export class Passo1Controller {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const { inicio, final } = req.body

        const db = new AppContext()
        const db2 = new AppContext2()

        const productOrders = await db.query(`
          SELECT
            st.name status,
            cab.date_added dataped,
            det.order_product_id trans_det,
            det.order_id trans_cab,cab.customer_id,
            det.product_id codprod,
            op1.product_option_value_id codprod1,
            convert(det.name,varchar(100)) descri1,
            det.model modelo,
            convert(op2.codigo_de_barra,varchar(16)) codbarra,
            convert(ds.name,varchar(100)) descricao,
            op2.option_id,op2.option_value_id,
            dstam.name tamanho,
            det.quantity qtde,
            det.price precounit,
            det.total total_item,cab.total total_venda,
            cab.custom_field cpf,
            convert(cab.payment_custom_field,varchar(50)) compl,
            tt.value frete,'N' emitido,
            cab.payment_firstname nome1,
            cab.payment_lastname nome2,
            cab.payment_address_1 endereco,
            cab.payment_address_2 bairro,
            cab.payment_city cidade,
            cab.payment_zone uf,
            cab.payment_postcode cep,
            cab.order_status_id status1,
            cab.email,cab.telephone fone
          FROM oc_order_product det, oc_order cab,oc_order_option op1, oc_product_option_value op2, oc_order_status st, oc_order_total tt, oc_product_description ds, oc_option_value_description dstam
          WHERE cab.order_id = det.order_id and op1.order_id = det.order_id
          and op1.order_product_id = det.order_product_id
          and op2.product_id = det.product_id
          and op2.product_option_value_id = op1.product_option_value_id
          and st.order_status_id = cab.order_status_id
          and tt.order_id = cab.order_id
          and tt.code = 'shipping'
          and ds.product_id = det.product_id
          and dstam.option_id = op2.option_id
          and dstam.option_value_id = op2.option_value_id
          and cab.date_added between '${inicio} 00:00:00' and '${final} 23:59:59' and cab.order_status_id = 19
          ORDER BY det.order_id`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const skill_cab_vendas = await db2.query(`
          SELECT
            numero,
            data,
            codprod,
            codprod1,
            separado,
            codloja
          FROM skill_cab_vendas
          `,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const parceiros = await db2.query(`
          SELECT
            codparc,
            Upper(parceiro) parceiro,
            email, 11 AS codloja_priori
          FROM skill_cab_parceiro
          ORDER BY parceiro`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const estoque = await db2.query(`
          SELECT
            loj_est_loja_id AS codloja,
            loj_est_product_id AS codprod,
            loj_est_product_option_value_id AS codprod1,
            loj_est_quantidade AS qtde,
            CONVERT(loj_est_codigo_de_barra,char(20)) AS codbarra
		      FROM lojas_estoque`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const empresas = await db2.query(`
          SELECT loj_id codloja, UPPER(CONVERT(loj_nome,char(40))) empresa FROM lojas order by loj_id`,
          {type: Sequelize.QueryTypes.SELECT}
        )

        const groupedOrders = productOrders.reduce((acc, item) => {

          let order = acc.find((o) => o.trans_cab === item.trans_cab)

          if (!order) {
            order = {
              trans_cab: item.trans_cab,
              status: item.status,
              dataped: item.dataped,
              customer_id: item.customer_id,
              total_venda: item.total_venda,
              cpf: item.cpf,
              compl: item.compl,
              frete: item.frete,
              emitido: item.emitido,
              nome1: item.nome1,
              nome2: item.nome2,
              endereco: item.endereco,
              bairro: item.bairro,
              cidade: item.cidade,
              uf: item.uf,
              cep: item.cep,
              status1: item.status1,
              email: item.email,
              fone: item.fone,
              itens: [],
            };
            acc.push(order);
          }

          order.itens.push({
            trans_det: item.trans_det,
            codprod: item.codprod,
            codprod1: item.codprod1,
            descri1: item.descri1,
            modelo: item.modelo,
            codbarra: item.codbarra,
            descricao: item.descricao,
            option_id: item.option_id,
            option_value_id: item.option_value_id,
            tamanho: item.tamanho,
            qtde: item.qtde,
            precounit: item.precounit,
            total_item: item.total_item,
          });

          return acc;
        }, [])

        let vendas = []

        for (const order of _.cloneDeep(groupedOrders)) {

          const parc = (_.filter(parceiros, (parc) => parc.email == order?.email?.split("@")[1]))[0]

          const itens = _.cloneDeep(order.itens)

          order.itens = []

          for (const item of itens) {

            const cab_venda = _.filter(skill_cab_vendas, (cab_venda) => cab_venda.numero == order.trans_cab && cab_venda.codprod == item.codprod && cab_venda.codprod1 == item.codprod1)

            if (_.size(cab_venda) > 0) {
              continue
            }

            let estoq = _.filter(estoque, (estoq) => estoq.codprod == item.codprod && estoq.codprod1 == item.codprod1)

            let codloja = 11

            if (parc.codloja_priori == 0) {

              if (_.sumBy(estoq, 'qtde') == 0) {
                codloja = 1
              } else {
                codloja = _.orderBy(estoq, ['qtde'], ['desc'])[0]?.codloja
              }

            } else {

              const qtde = _.filter(estoq, (estoque) => estoque.codloja == parc.codloja_priori)[0]?.qtde || 0

              if (item.qtde <= qtde) {

                codloja = parc.codloja_priori

              } else {
                
                estoq = _.filter(estoq, (estoque) => estoque.codloja != parc.codloja_priori)

                codloja = _.orderBy(estoq, ['qtde'], ['desc'])[0]?.codloja

              }

              if (!codloja) {
                codloja = 11
              }

            }

            const fat = _.filter(empresas, (parc) => parc.codloja == codloja)[0]

            order.itens.push({...item, fat})

          }

          if (_.size(order.itens) > 0) {
            vendas.push({...order, parc})
          }

        }

        vendas = _.orderBy(vendas, ['trans_cab'])

        res.status(200).json({
          request: {
            inicio, final
          },
          response: {
            rows: vendas, count: vendas.length,
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  relatorio = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const report = await Report.generate({
          report: 'relacao-produtos.html',
          company: req.body.items[0].fat?.empresa,
          title: 'RelatÃ³rio de produtos',
          data: {
            items: req.body.items
          }
        })

        res.status(200).json({pdf: report})

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
          
          const cab_venda = await db.query(`SELECT numero FROM skill_cab_vendas WHERE data BETWEEN '${req.body.inicio}' AND '${req.body.final}'`, {type: Sequelize.QueryTypes.SELECT, transaction})

          for (const item of req.body.items) {

            if (item.trans_cab != 408661) {
              continue
            }
  
            if (_.size(_.filter(cab_venda, (venda) => venda.numero == item.trans_cab && venda.data == item.dataped)) == 0) {
  
              const sqlInsert = `
                INSERT INTO skill_cab_vendas (numero, data, codprod, codprod1, codloja) VALUES (${item.trans_cab}, '${dayjs(item.dataped).format('YYYY-MM-DD')}', ${item.codprod}, ${item.codprod1}, ${item.fat?.codloja});
              `
  
              const sqlUpdate = `
                UPDATE produto_pendente SET prod_pen_loja_id_saida = '${item.fat?.codloja}' WHERE prod_pen_id_pedido = '${item.trans_cab}' AND prod_pen_codigo_de_barras = '${item.codbarra}';
              `
  
              await db.query(sqlInsert, {type: Sequelize.QueryTypes.INSERT, transaction})
              await db.query(sqlUpdate, {type: Sequelize.QueryTypes.UPDATE, transaction})

            }
  
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