import express, { Router } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url"

import { Passo1Route } from './src/routes/passo-1.route.js'
import { Passo2Route } from './src/routes/passo-2.route.js'

import { SearchRoute } from './src/routes/search.js'
import { Passo3Route } from './src/routes/passo-3.route.js'
import { Passo4Route } from './src/routes/passo-4.route.js'
import { Passo5Route } from './src/routes/passo-5.route.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const directory = {
  uploads: path.join(__dirname, 'uploads')
}

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

    this.express.use(express.json({ limit: '50mb' }))
    this.express.use(express.urlencoded({ limit: '50mb', extended: true }))

    this.express.use(cors(corsOptions))
    this.express.use(express.json())

  }

  initializeRoutes = () => {

    //this.express.use('/api/login', new LoginRoute().router)

    //Cadastros
    this.express.use('/api/passo-1', new Passo1Route().router)
    this.express.use('/api/passo-2', new Passo2Route().router)
    this.express.use('/api/passo-3', new Passo3Route().router)
    this.express.use('/api/passo-4', new Passo4Route().router)
    this.express.use('/api/passo-5', new Passo5Route().router)

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