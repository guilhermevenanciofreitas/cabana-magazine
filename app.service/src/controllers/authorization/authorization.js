import { AppContext } from "../../database/index.js"
import { DateTime } from "../../utils/datetime.js"
import dayjs from 'dayjs'

export class Authorization {

  static async verify(req, res) {

    if (!req.headers.authorization) {
      throw new Error('E necessário realizar o login!')
    }

    const db = new AppContext()

    let session

    await db.transaction(async (transaction) => {

      session = await db.Session.findOne({
        attributes: ['id', 'companyId', 'userId', 'lastAcess', 'expireIn'],
        include: [
          {model: db.Company, as: 'company', attributes: ['id', 'name']},
          {model: db.User, as: 'user', attributes: ['id', 'name']}
        ],
        where: {id: req.headers.authorization},
        transaction
      })
  
      //Verificar se token ainda e válido
      if (!session?.lastAcess || DateTime.from(session.lastAcess).add(session.expireIn, 'minute').isBefore(dayjs())) {
        session?.destroy()
        throw new Error("Sua sessão expirou!")
      };
  
      session.lastAcess = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
      res.setHeader('Last-Acess', session.lastAcess)
      res.setHeader('Expire-In', session.expireIn)
  
      await session.save()

    })

    return {
      company: session.company,
      user: session.user
    }

  }

}