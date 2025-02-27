import { Router } from 'express'
import { CadastrosParceiroController } from '../../controllers/cadastros/parceiro.controller.js'

export class ParceiroRoute {

    router = Router()
    controller = new CadastrosParceiroController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/editar', async (req, res) => await this.controller.editar(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
        this.router.post('/excluir', async (req, res) => await this.controller.excluir(req, res))
    }

}