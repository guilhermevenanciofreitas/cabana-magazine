import { Router } from 'express'
import { SearchController } from '../controllers/search/search.js'

export class SearchRoute {

    router = Router()
    controller = new SearchController()

    constructor() {
        this.intializeRoutes()
    }

    intializeRoutes() {
        this.router.post('/empresa', async (req, res) => await this.controller.empresa(req, res))
        this.router.post('/produto', async (req, res) => await this.controller.produto(req, res))
    }

}