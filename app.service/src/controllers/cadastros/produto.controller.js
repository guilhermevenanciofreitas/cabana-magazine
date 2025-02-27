import { AppContext } from "../../database/index.js"
import { Authorization } from "../authorization/authorization.js"
import { formidable } from 'formidable'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { fileURLToPath } from 'url'
import xml2js from 'xml2js'
import dayjs from "dayjs"
import Sequelize from "sequelize"
//import axios from 'axios'

import ejs from 'ejs'

import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Exception } from "../../utils/exception.js"
import { Report } from "../../reports/index.js"

export class CadastrosProdutoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0
        const search = req.body.search

        const where = []

        if (search?.input) {

          if (search?.picker == 'descricao') {
            where.push({'descricao': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        
        const produtos = await db.Produto.findAndCountAll({
          attributes: ['codprod', 'descricao', 'unidade', 'custo', 'customed', 'ultcomp'],
          limit: limit,
          offset: offset * limit,
          order: [['descricao', 'asc']],
          where,
        })

        res.status(200).json({
          request: {
            limit, offset
          },
          response: {
            rows: produtos.rows, count: produtos.count
          }
        })

      } catch (error) {
        res.status(500).json({message: error.message})
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  carregar = async (req, res) => {
    try {

      const db = new AppContext()

      await db.transaction(async (transaction) => {

        const unidades = await db.Unidade.findAll({attributes: ['unidade', 'descricao'], transaction})

        res.status(200).json({unidades})

      })

    } catch (error) {
      res.status(500).json({message: error.message})
    }
  }

  editar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const { codprod } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {

          const produto = await db.Produto.findOne({
            attributes: ['codprod', 'descricao', 'unidade', 'custo'],
            where: [{codprod}],
            transaction
          })

          res.status(200).json(produto)

        })

      } catch (error) {
        res.status(500).json({message: error.message})
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  salvar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        let produto = {
          codprod: req.body.codprod,
          descricao: req.body.descricao,
          unidade: req.body.unidade,
          custo: req.body.custo,
        }

        const db = new AppContext();

        await db.transaction(async (transaction) => {

          if (_.isNil(produto.codprod)) {

            const lastCodProd = await db.Produto.max('codprod', { transaction })
  
            produto.codprod = lastCodProd ? lastCodProd + 1 : 1

            produto = await db.Produto.create(produto, {transaction})

          } else {
            await db.Produto.update(produto, {where: [{codprod: produto.codprod}], transaction})
          }

        })

        res.status(200).json(produto)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  excluir = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const codprod = req.body

        const db = new AppContext();

        await db.transaction(async (transaction) => {
          await db.Produto.destroy({where: [{codprod: codprod}], transaction})
        })

        res.status(200).json({})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  imprimir = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const produtos = await db.Produto.findAll({
          attributes: ['codprod', 'descricao', 'unidade', 'custo', 'customed', 'ultcomp'],
          order: [['descricao', 'asc']]
        })

        const report = await Report.generate({
          report: 'produtos.html',
          title: 'Relatório de produtos',
          data: {
            items: produtos
          }
        });
        

        res.status(200).json({pdf: report})

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }


}