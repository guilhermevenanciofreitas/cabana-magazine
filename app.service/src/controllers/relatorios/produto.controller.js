import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"

export class RelatorioProdutoController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()

        const produtos = await db.Produto.findAll({
          attributes: ['codprod', 'descricao', 'unidade', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']],
          include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Local, as: 'local', attributes: ['codloc', 'descricao']}
            ]}
          ],
          group: ['produto.codprod', 'produto.descricao', 'produto.unidade', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.local.id', 'estoques.local.codloc', 'estoques.local.descricao'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'ASC']]
        })

        res.status(200).json({
          response: {
            rows: produtos
          }
        })

      } catch (error) {
        Exception.error(res, error)
      }
    //}).catch((error) => {
    //  res.status(400).json({message: error.message})
    //})
  }

}