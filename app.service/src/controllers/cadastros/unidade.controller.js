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

import fetch from 'node-fetch';
import { Buffer } from 'buffer';

export class CadastrosUnidadeController {

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
        
        const unidades = await db.Unidade.findAndCountAll({
          attributes: ['unidade', 'descricao'],
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
            rows: unidades.rows, count: unidades.count
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  editar = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const { unidade } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {
            
          const unidades = await db.Unidade.findOne({
            attributes: ['unidade', 'descricao'],
            where: [{unidade: unidade}],
            transaction
          })

          res.status(200).json(unidades)
          
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

        const tipo = req.body.tipo

        let unidade = {
          unidade: req.body.unidade,
          descricao: req.body.descricao,
        }

        const db = new AppContext();

        await db.transaction(async (transaction) => {

          if (tipo == 1) {
            unidade = await db.Unidade.create(unidade, {transaction})
          } else {
            await db.Unidade.update(unidade, {where: [{unidade: unidade.unidade}], transaction})
          }

        })

        res.status(200).json(unidade)

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

        const unidade = req.body

        const db = new AppContext();

        await db.transaction(async (transaction) => {
          await db.Unidade.destroy({where: [{unidade: unidade}], transaction})
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