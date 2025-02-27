import { Router } from 'express'
import { RelatorioProdutoController } from '../../controllers/relatorios/produto.controller.js'

export class RelatorioProdutoRoute {

    router = Router()
    controller = new RelatorioProdutoController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
    }

}