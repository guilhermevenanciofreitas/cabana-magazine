import { Router } from 'express'
import { Passo4Controller } from '../controllers/passo-4.controller.js'

export class Passo4Route {

    router = Router()
    controller = new Passo4Controller()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}