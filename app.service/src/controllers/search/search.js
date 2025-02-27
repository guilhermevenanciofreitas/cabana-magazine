import { Authorization } from "../authorization/authorization.js";
import { AppContext } from '../../database/index.js'
import Sequelize from "sequelize"
import { Exception } from "../../utils/exception.js";
import { AppContext2 } from "../../database2/index.js";

export class SearchController {

    empresa = async (req, res) => {
        //Authorization.verify(req, res).then(async ({company}) => {
            try {

                const db = new AppContext2()

                const empresas = await db.query(`SELECT loj_id, loj_nome FROM lojas WHERE loj_nome LIKE '%${req.body.search.replace(' ', '%')}%' ORDER BY loj_nome ASC`, {
                    type: Sequelize.QueryTypes.SELECT,
                })

                res.status(200).json(empresas)

            } catch (error) {
                Exception.error(res, error)
            }
        //}).catch((error) => {
        //    //Exception.unauthorized(res, error);
        //});
    }

    produto = async (req, res) => {
        //Authorization.verify(req, res).then(async ({company}) => {
            try {

                const db = new AppContext()

                const where = []

                where.push({
                    [Sequelize.Op.or]: [
                        {'$codprod$': {[Sequelize.Op.like]: req.body?.search}},
                        {'$descricao$': {[Sequelize.Op.like]: `%${req.body?.search.replace(' ', "%").toUpperCase()}%`}},
                    ],
                })

                const produtos = await db.Produto.findAll({
                    attributes: ['codprod', 'descricao', 'unidade', 'custo'],
                    where,
                    order: [
                        ['descricao', 'asc']
                    ],
                    limit: 20
                })

                res.status(200).json(produtos)

            } catch (error) {
                Exception.error(res, error)
            }
        //}).catch((error) => {
        //    //Exception.unauthorized(res, error);
        //});
    }

}