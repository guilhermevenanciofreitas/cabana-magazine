import Sequelize from "sequelize"
import { AppContext } from "../../database/index.js"
import { Exception } from "../../utils/exception.js"

export class RelatorioLocalController {

  lista = async (req, res) => {
    //await Authorization.verify(req, res).then(async ({company}) => {
      try {

        const db = new AppContext()
        
        const locais = await db.Local.findAll({
          attributes: ['codloc', 'descricao', [Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), 'saldo_total']], include: [
            {model: db.Estoque, as: 'estoques', attributes: ['codloc', 'saldo'], include: [
              {model: db.Produto, as: 'produto', attributes: ['codprod', 'descricao']}
            ]}
          ],
          group: ['local.codloc', 'local.descricao', 'estoques.id', 'estoques.codloc', 'estoques.saldo', 'estoques.produto.id', 'estoques.produto.codprod', 'estoques.produto.descricao'],
          having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('estoques.saldo')), { [Sequelize.Op.gt]: 0 }),
          order: [['descricao', 'asc']]
        })

        res.status(200).json({
          response: {
            rows: locais
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