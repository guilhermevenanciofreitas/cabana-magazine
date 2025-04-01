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

export class EstoqueController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const { inicio, final, empresa } = req.body

        const db = new AppContext()
        const db2 = new AppContext2()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0

        const query = `
          select
          pd.sku,convert(op2.codigo_de_barra,char(16)) codbarra,Upper(convert(ds.name,char(100))) descricao,
          pd.product_id codprod,op2.product_option_value_id codprod1,dstam.name tamanho,op2.quantity estoque,
          pd.model modelo,pd.manufacturer_id codmarca,Upper(ma.name) marca
          from oc_product pd, oc_product_description ds, oc_product_option_value op2, oc_option_value_description dstam,
          oc_manufacturer ma
          where ds.product_id = pd.product_id and
          op2.product_id = pd.product_id and dstam.option_value_id = op2.option_value_id and ma.manufacturer_id = pd.manufacturer_id
          and op2.codigo_de_barra is not null and op2.codigo_de_barra <> ''
          order by descricao
        `

        const query2 = `
          select loj_est_loja_id codloja,loj_est_product_id codprod,loj_est_product_option_value_id codprod1,
          loj_est_quantidade estoque
          from lojas_estoque
        `
        
        const products = await db.query(query, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const storeInventory = await db2.query(query2, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const finalStocks = products.map(row => {
          return {
            sku: row.sku,
            descricao: row.descricao,
            tamanho: row.tamanho,
            codbarra: row.codbarra,
            estoque: row.estoque,
            // For each store, try to find the corresponding inventory; default to 0 if not found.
            loja01: storeInventory[`${row.codprod}_${row.codprod1}_1`] || 0,
            loja08: storeInventory[`${row.codprod}_${row.codprod1}_8`] || 0,
            loja10: storeInventory[`${row.codprod}_${row.codprod1}_10`] || 0,
            loja12: storeInventory[`${row.codprod}_${row.codprod1}_12`] || 0,
            loja11: storeInventory[`${row.codprod}_${row.codprod1}_11`] || 0,
            marca: row.marca,
            codprod: row.codprod,
            codprod1: row.codprod1,
            // Additional fields as in the original conversion (e.g., duplicating some fields)
            sku1: row.sku,
            descricao1: row.descricao,
            tamanho1: row.tamanho,
            seq: 0 // Original FoxPro set this as "0000"
          };
        });

        res.status(200).json({
          request: {
            limit, offset
          },
          response: {
            rows: finalStocks, count: finalStocks.length,//rows: orders.rows, count: orders.count
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

            const { numero, codprod, codprod1, end_etiqueta, end_danfe } = item
  
            await db.query(`UPDATE skill_cab_vendas SET end_etiqueta = '${end_etiqueta}', end_danfe = '${end_danfe}' WHERE numero = ${numero} and codprod = ${codprod} and codprod1 = ${codprod1}`, {
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