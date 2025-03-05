import { Router } from 'express'
import { Passo5Controller } from '../controllers/passo-5.controller.js'

export class Passo5Route {

    router = Router()
    controller = new Passo5Controller()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}