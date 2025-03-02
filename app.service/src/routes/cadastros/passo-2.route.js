import { Router } from 'express'
import { Passo2Controller } from '../../controllers/passo-2.controller.js'

export class Passo2Route {

    router = Router()
    controller = new Passo2Controller()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}