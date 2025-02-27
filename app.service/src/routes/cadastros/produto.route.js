import { Router } from 'express'
import { CadastrosProdutoController } from '../../controllers/cadastros/produto.controller.js'

export class ProdutoRoute {

    router = Router()
    controller = new CadastrosProdutoController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/lista', async (req, res) => await this.controller.lista(req, res))
        this.router.post('/carregar', async (req, res) => await this.controller.carregar(req, res))
        this.router.post('/editar', async (req, res) => await this.controller.editar(req, res))
        this.router.post('/salvar', async (req, res) => await this.controller.salvar(req, res))
        this.router.post('/excluir', async (req, res) => await this.controller.excluir(req, res))
        this.router.post('/imprimir', async (req, res) => await this.controller.imprimir(req, res))
    }

}