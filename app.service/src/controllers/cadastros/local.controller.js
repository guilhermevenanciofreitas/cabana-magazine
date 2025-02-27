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

export class CadastrosLocalController {

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
        
        const locais = await db.Local.findAndCountAll({
          attributes: ['codloc', 'descricao'],
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
            rows: locais.rows, count: locais.count
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

        const { codloc } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {
            
          const locais = await db.Local.findOne({
            attributes: ['codloc', 'descricao'],
            where: [{codloc}],
            transaction
          })

          res.status(200).json(locais)
          
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

  salvar = async (req, res) => {
    try {

      let local = {
        codloc: req.body.codloc,
        descricao: req.body.descricao,
      }
  
      const db = new AppContext()
  
      await db.transaction(async (transaction) => {

        if (_.isNil(local.codloc)) {

          const lastCodloc = await db.Local.max('codloc', { transaction })
  
          local.codloc = lastCodloc ? lastCodloc + 1 : 1

          local = await db.Local.create(local, { transaction })

        } else {
          await db.Local.update(local, { where: { codloc: local.codloc }, transaction })
        }
  
        res.status(200).json(local)

      })
  
    } catch (error) {
      Exception.error(res, error)
    }
  }
  
  excluir = async (req, res) => {
    //await Authorization.verify(req, res).then(async () => {
      try {

        const codloc = req.body

        const db = new AppContext();

        await db.transaction(async (transaction) => {
          await db.Local.destroy({where: [{codloc: codloc}], transaction})
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