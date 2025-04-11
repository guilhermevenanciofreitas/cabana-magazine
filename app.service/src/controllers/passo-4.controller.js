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
import pdf from 'pdf-parse'
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { Exception } from "../utils/exception.js"

import sql from 'mssql'
import { AppContext2 } from "../database2/index.js"

//import { createReadStream } from "fs";
import fsPromise from 'fs/promises';

import { directory } from "../../app.js"


export class Passo4Controller {

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
          det.quantity qtde,det.price precounit,det.total total_item,cab.total total_venda,cab.custom_field cpf,Space(20) codcaixa,
          convert(cab.payment_custom_field,varchar(50)) compl,tt.value frete,'N' gerouxml,Space(250) end_etiqueta,Space(250) end_danfe,
          cab.payment_firstname nome1,cab.payment_lastname nome2,cab.payment_address_1 endereco,cab.payment_address_2 bairro,000 codloja,
          cab.payment_city cidade,cab.payment_zone uf,cab.payment_postcode cep,cab.order_status_id status_id,cab.email,cab.telephone fone,tt.code
          from oc_order_product det,
          oc_order cab, oc_order_option op1, oc_product_option_value op2, oc_order_status st, oc_order_total tt,
          oc_product_description ds, oc_option_value_description dstam
          where
          cab.order_id = det.order_id and op1.order_id = det.order_id and op1.order_product_id = det.order_product_id and
          op2.product_id = det.product_id and op2.product_option_value_id = op1.product_option_value_id and
          st.order_status_id = cab.order_status_id and tt.order_id = cab.order_id and tt.code = 'shipping' and
          ds.product_id = det.product_id and dstam.option_id = op2.option_id and dstam.option_value_id = op2.option_value_id and
          cab.date_added BETWEEN '${inicio} 00:00' AND '${final} 23:59' and (cab.order_status_id = -1 or cab.order_status_id = 19 or
          cab.order_status_id = 21 or cab.order_status_id = 35 or cab.order_status_id = 28 or cab.order_status_id = 18)
        `

        const productOrders = await db.query(query, {
          type: Sequelize.QueryTypes.SELECT,
        })

        const skill_cab_vendas = await db2.query(`SELECT numero, data, codprod, codprod1, separado, codloja, codcaixa FROM skill_cab_vendas WHERE data BETWEEN '${inicio}' AND '${final}' AND gerouxml = 1 AND enviado = 0`, {
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

            items.push({...item, parc: parc, fat, codloja: cab_venda[0]?.codloja, codcaixa: cab_venda[0]?.codcaixa})

          }

        }

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

            const { numero, codprod, codprod1 } = item
  
            await db.query(`UPDATE skill_cab_vendas SET enviado = 1 WHERE numero = ${numero} and codprod = ${codprod} and codprod1 = ${codprod1}`, {
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

  uploadDanfe = async (req, res) => {
   // await Authorization.verify(req, res).then(async ({companyId, userId}) => {
      try {

        const form = formidable({})

        const archives = await form.parse(req)

        const files = []

        const uploadDir = path.join(directory.uploads, 'danfe')

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        for (const file of archives[1].files) {

          const pdfBuffer = fs.readFileSync(file.filepath)
 
          const base64Pdf = pdfBuffer.toString('base64')

          const outputBuffer = Buffer.from(base64Pdf, 'base64')

          const outputPath = path.join(uploadDir, file.originalFilename || 'output.pdf')

          fs.writeFileSync(outputPath, outputBuffer)

          files.push({pdf: base64Pdf})

        }

        res.status(200).json(files)

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  Exception.unauthorized(res, error)
    //})
  }

  uploadEtiqueta = async (req, res) => {
    // await Authorization.verify(req, res).then(async ({companyId, userId}) => {
       try {
 
         const form = formidable({})
 
         const archives = await form.parse(req)
 
         const files = []
 
         const uploadDir = path.join(directory.uploads, 'etiqueta')
 
         if (!fs.existsSync(uploadDir)) {
             fs.mkdirSync(uploadDir, { recursive: true })
         }
 
         for (const file of archives[1].files) {
 
           const pdfBuffer = fs.readFileSync(file.filepath)
  
           const base64Pdf = pdfBuffer.toString('base64')
 
           const outputBuffer = Buffer.from(base64Pdf, 'base64')
 
           const outputPath = path.join(uploadDir, file.originalFilename || 'output.pdf')
 
           fs.writeFileSync(outputPath, outputBuffer)
 
           files.push({pdf: base64Pdf})
 
         }
 
         res.status(200).json(files)
 
       } catch (error) {
         Exception.error(res, error)
       }
     //}).catch((error) => {
     //  Exception.unauthorized(res, error)
     //})
   }

  danfe = async (req, res) => {
    try {

      const uploadDir = path.join(directory.uploads, 'danfe')

      const arquivos = await fsPromise.readdir(uploadDir)

      for (const arquivo of arquivos) {

        const caminhoArquivo = path.join(uploadDir, arquivo);

        const contemTexto = this.verificarTextoNoArquivo(caminhoArquivo, req.body.cpf)
        if (contemTexto) {
          const caminhoPDF = caminhoArquivo.replace('procNfe.xml', 'DANFE.pdf')
          const base64 = this.converterArquivoParaBase64(caminhoPDF)
          return res.status(200).json({ pdf: base64 })
        }
      }

      return res.status(201).json({ message: 'Arquivo nÃ£o encontrado!' })

    } catch (error) {
      Exception.error(res, error)
    }
  }

  etiqueta = async (req, res) => {
    try {

      const uploadDir = path.join(directory.uploads, 'etiqueta')

      const arquivos = await fsPromise.readdir(uploadDir)

      for (const arquivo of arquivos) {

        const caminhoArquivo = path.join(uploadDir, arquivo);

        const contemTexto = this.verificarTextoNoArquivo(caminhoArquivo, req.body.etiqueta)
        if (contemTexto) {
          const caminhoPDF = caminhoArquivo.replace('.txt', '.pdf')
          const base64 = this.converterArquivoParaBase64(caminhoPDF)
          return res.status(200).json({ pdf: base64 })
        }
      }

      return res.status(201).json({ message: 'Arquivo nÃ£o encontrado!' })

    } catch (error) {
      Exception.error(res, error)
    }
  }

  verificarTextoNoArquivo = (caminhoArquivo, textoProcurado) => {
    try {
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf8')
        if (conteudo.toUpperCase().includes(textoProcurado.toUpperCase())) {
            return true
        } else {
            return false
        }
    } catch (erro) {
        return false
    }
  }

  converterArquivoParaBase64 = (caminhoArquivo) => {
    try {
        const dados = fs.readFileSync(caminhoArquivo)
        const base64 = dados.toString('base64')
        return base64
    } catch (erro) {
        return null
    }
  }

  excluirArquivos = async (req, res) => {
    try {

      this.excluirArquivosDoDiretorio(path.join(directory.uploads, 'etiqueta'))
      this.excluirArquivosDoDiretorio(path.join(directory.uploads, 'danfe'))

      return res.status(200).json({message: 'Excluido com sucesso!'})

    } catch (error) {
      Exception.error(res, error)
    }

  }

  excluirArquivosDoDiretorio = async (diretorio) => {
    try {
      const arquivos = await fs.promises.readdir(diretorio);
  
      for (const arquivo of arquivos) {
        const caminhoCompleto = path.join(diretorio, arquivo);
        const stats = await fs.promises.lstat(caminhoCompleto);
  
        if (stats.isFile()) {
          await fs.promises.unlink(caminhoCompleto);
          console.log(`Arquivo removido: ${caminhoCompleto}`);
        }
      }
  
      console.log('Todos os arquivos foram excluídos.');

    } catch (erro) {
      console.error('Erro ao excluir arquivos:', erro);
    }
  }

}