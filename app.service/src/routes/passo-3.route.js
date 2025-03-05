import { Router } from 'express'
import { Passo3Controller } from '../controllers/passo-3.controller.js'

export class Passo3Route {

    router = Router()
    controller = new Passo3Controller()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}