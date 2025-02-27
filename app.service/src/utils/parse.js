import { Builder, parseStringPromise } from "xml2js";

export class Parse {

    static XmlToJson = async (xml) => {

        return await parseStringPromise(xml, {explicitArray: false});

    }

    static JsonToXml = (json) => {

        return new Builder( { headless: true, renderOpts: { pretty: true } }).buildObject(json);

    }

}