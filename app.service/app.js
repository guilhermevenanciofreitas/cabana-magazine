import express, { Router } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url"

import { ProdutoRoute } from './src/routes/cadastros/produto.route.js'
import { UnidadeRoute } from './src/routes/cadastros/unidade.route.js'
import { LocalRoute } from './src/routes/cadastros/local.route.js'
import { TipoEntSaiRoute } from './src/routes/cadastros/tipoEntSai.route.js'
import { ParceiroRoute } from './src/routes/cadastros/parceiro.route.js'
import { EntradaSaidaRoute } from './src/routes/cadastros/entradaSaida.route.js'
import { SearchRoute } from './src/routes/search.js'
import { RelatorioProdutoRoute } from './src/routes/relatorios/produto.route.js'
import { RelatorioLocalRoute } from './src/routes/relatorios/local.route.js'

export class App {

  express = express()

  constructor() {
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializePublic()
  }

  initializeMiddlewares = () => {

    const corsOptions = {
      origin: '*',
      exposedHeaders: ['Last-Acess', 'Expire-In'],
    }

    this.express.use(cors(corsOptions))
    this.express.use(express.json())

  }

  initializeRoutes = () => {

    //this.express.use('/api/login', new LoginRoute().router)

    //Cadastros
    this.express.use('/api/entrada-saida', new EntradaSaidaRoute().router)

    this.express.use('/api/cadastros/produto', new ProdutoRoute().router)
    this.express.use('/api/cadastros/unidade', new UnidadeRoute().router)
    this.express.use('/api/cadastros/local', new LocalRoute().router)
    this.express.use('/api/cadastros/tipos-entrada-saida', new TipoEntSaiRoute().router)
    this.express.use('/api/cadastros/parceiro', new ParceiroRoute().router)

    //Relatorios
    this.express.use('/api/relatorios/produto', new RelatorioProdutoRoute().router)
    this.express.use('/api/relatorios/local', new RelatorioLocalRoute().router)

    this.express.use('/api/search', new SearchRoute().router)

  }

  initializePublic = () => {
        
    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    this.express.use(express.static(path.join(__dirname, "public")))
    this.express.use(express.static(path.join(__dirname, "build")))

    this.express.get("/mobile", (req, res) => {
      res.sendFile(path.join(__dirname, "build", "index.html"))
    })

    this.express.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"))
    })

  }

  listen = (port) => {
    this.express.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  }

}