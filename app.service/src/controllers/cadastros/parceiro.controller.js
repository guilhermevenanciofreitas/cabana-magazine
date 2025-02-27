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

export class CadastrosParceiroController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const limit = req.body.limit || 50
        const offset = req.body.offset || 0
        const search = req.body.search

        const where = []

        if (search?.input) {

          if (search?.picker == 'nome') {
            where.push({'nome': {[Sequelize.Op.like]: `%${search.input.replace(' ', "%")}%`}})
          }
  
        }
        
        const unidades = await db.Parceiro.findAndCountAll({
          attributes: ['codparc', 'tipo', 'nome'],
          limit: limit,
          offset: offset * limit,
          order: [['nome', 'asc']],
          where,
        })

        const unidadesAlteradas = unidades.rows.map(unidade => {
          return {
            ...unidade.dataValues,
            tipo: unidade.tipo === 1 ? 'C' : unidade.tipo === 2 ? 'F' : unidade.tipo
          };
        });

        res.status(200).json({
          request: {
            limit, offset
          },
          response: {
            rows: unidadesAlteradas, count: unidades.count
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

        const { codparc } = req.body

        const db = new AppContext()

        await db.transaction(async (transaction) => {
            
          const parceiro = await db.Parceiro.findOne({
            attributes: ['codparc', 'tipo', 'nome'],
            where: [{codparc}],
            transaction
          })

          res.status(200).json(parceiro)
          
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

        let parceiro = {
          codparc: req.body.codparc,
          tipo: req.body.tipo,
          nome: req.body.nome,
        }

        const db = new AppContext();

        await db.transaction(async (transaction) => {

          if (_.isNil(parceiro.codparc)) {

            const lastCodParc = await db.Parceiro.max('codparc', { transaction })
  
            parceiro.codparc = lastCodParc ? lastCodParc + 1 : 1

            parceiro = await db.Parceiro.create(parceiro, {transaction})

          } else {
            await db.Parceiro.update(parceiro, {where: [{codparc: parceiro.codparc}], transaction})
          }

        })

        res.status(200).json(parceiro)

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

        const codparc = req.body

        const db = new AppContext();

        await db.transaction(async (transaction) => {
          await db.Parceiro.destroy({where: [{codparc: codparc}], transaction})
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