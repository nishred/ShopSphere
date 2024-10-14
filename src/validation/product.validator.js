import {zod} from "zod"


export const updateProductSchema = zod.object({

    name : zod.string().optional(),
    price: zod.string().optional(),
    description : zod.string().optional(),
    stock : zod.number().optional(),
    sold : zod.number().optional(),
    collectionID : zod.string().optional()    

}).strict()


