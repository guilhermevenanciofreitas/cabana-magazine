import express, { Router } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url"

import { Passo1Route } from './src/routes/cadastros/passo-1.route.js'
import { Passo2Route } from './src/routes/cadastros/passo-2.route.js'

import { SearchRoute } from './src/routes/search.js'

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

    this.express.use(express.json({ limit: '50mb' })); // Aumenta o limite do JSON
    this.express.use(express.urlencoded({ limit: '50mb', extended: true })); // Aumenta o limite para form-data

    this.express.use(cors(corsOptions))
    this.express.use(express.json())

  }

  initializeRoutes = () => {

    //this.express.use('/api/login', new LoginRoute().router)

    //Cadastros
    this.express.use('/api/passo-1', new Passo1Route().router)
    this.express.use('/api/passo-2', new Passo2Route().router)

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