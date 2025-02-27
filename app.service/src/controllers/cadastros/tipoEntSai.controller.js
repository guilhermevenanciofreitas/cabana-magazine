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
import { Exception } from "../../utils/exception.js"

export class CadastrosTipoEntSaiController {

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
        
        const tiposEntSai = await db.TipoEntSai.findAndCountAll({
          attributes: ['codentsai', 'tipo', 'descricao', 'orig', 'dest'],
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
            rows: tiposEntSai.rows, count: tiposEntSai.count
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

        const { codentsai } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {
            
          const tiposEntSai = await db.TipoEntSai.findOne({
            attributes: ['codentsai', 'tipo', 'descricao', 'orig', 'dest'],
            where: [{codentsai}],
            transaction
          })

          res.status(200).json(tiposEntSai)
          
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

        let tipEntSai = {
          codentsai: req.body.codentsai,
          tipo: req.body.tipo,
          descricao: req.body.descricao,
          orig: req.body.orig,
          dest: req.body.dest,
        }

        const db = new AppContext();

        await db.transaction(async (transaction) => {

          if (_.isNil(tipEntSai.codentsai)) {
            const lastCodentsai = await db.TipoEntSai.max('codentsai', { transaction })
  
            tipEntSai.codentsai = lastCodentsai ? lastCodentsai + 1 : 1

            tipEntSai = await db.TipoEntSai.create(tipEntSai, {transaction})

          } else {
            await db.TipoEntSai.update(tipEntSai, {where: [{codentsai: tipEntSai.codentsai}], transaction})
          }

        })

        res.status(200).json(tipEntSai)

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

        const codentsai = req.body

        const db = new AppContext();

        await db.transaction(async (transaction) => {
          await db.TipoEntSai.destroy({where: [{codentsai: codentsai}], transaction})
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