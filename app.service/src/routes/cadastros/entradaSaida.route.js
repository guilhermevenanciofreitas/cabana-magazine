import { Router } from 'express'
import { EntradaSaidaController } from '../../controllers/entradaSaida.controller.js'

export class EntradaSaidaRoute {

    router = Router()
    controller = new EntradaSaidaController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}