import _ from "lodash";
import { Service } from "../service"

export const Search = {

    empresa: async (search) => {
        return (await new Service().Post("search/empresa", {search}))?.data
    },

    produto: async (search) => {
        return (await new Service().Post("search/produto", {search}))?.data
    },

}