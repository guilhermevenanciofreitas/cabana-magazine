import { Router } from 'express'
import { Passo1Controller } from '../controllers/passo-1.controller.js'

export class Passo1Route {

    router = Router()
    controller = new Passo1Controller()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/relatorio', async (req, res) => await this.controller.relatorio(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
    }

}