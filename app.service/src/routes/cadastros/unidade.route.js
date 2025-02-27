import { Router } from 'express'
import { CadastrosUnidadeController } from '../../controllers/cadastros/unidade.controller.js'

export class UnidadeRoute {

    router = Router()
    controller = new CadastrosUnidadeController()

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