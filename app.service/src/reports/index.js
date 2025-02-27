import { AppContext } from '../database/index.js'

import ejs from 'ejs'
import puppeteer from 'puppeteer'

import path from 'path'
import { fileURLToPath } from 'url'

export class Report {

  static generate = async ({report, title, data}) => {
    
    const options = {
      title,
      logoUrl: 'path/to/logo.png',
      data,
      totalVendas: 500,
      totalItens: 7
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    return new Promise(async (resolve, reject) => {
      try {

        ejs.renderFile(`${__dirname}/layouts/${report}`, options, async (error, html) => {

          if (error) {
            reject(new Error(error.message))
          }

          const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          })

          const page = await browser.newPage()
          await page.setContent(html)

        const headerTemplate = `
            <div style="width: 100%; font-size: 12px; font-family: Arial, sans-serif; border-bottom: 1px solid #ccc; margin: 20px;">
                <div style="display: flex; justify-content: space-between; padding: 5px;">
                    <span style="font-size: 18px; font-weight: bold;">GASTROBAR</span>
                    <span style="font-size: 10px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px;">
                    <span style="font-size: 20px;">${title}</span>
                    <span style="font-size: 10px;">${new Date().toLocaleString()}</span>
                </div>
                <div style="width: 100%; height: 1px; background-color: #ccc; padding: 5px"></div>
            </div>
        `;

        const pdfBase64 = await page.pdf({
            format: "A4",
            displayHeaderFooter: true,
            headerTemplate: headerTemplate,
            /*footerTemplate: `
              <div style="font-size: 12px; text-align: center; width: 100%;">
                Página <span class="pageNumber"></span> de <span class="totalPages"></span>
              </div>
            `,*/
            footerTemplate: `<div></div>`,
            margin: {
              top: "140px",
              bottom: "40px",
            },
            encoding: 'base64'
          })

          await browser.close()

          resolve(Buffer.from(pdfBase64).toString('base64'))

        })

      } catch (error) {
        reject(new Error(error.message))
      }

    })

  }

}