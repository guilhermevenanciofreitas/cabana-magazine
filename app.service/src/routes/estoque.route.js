import { Router } from 'express'
import { EstoqueController } from '../controllers/estoque.controller.js'

export class EstoqueRoute {

    router = Router()
    controller = new EstoqueController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}