import {zod} from "zod"


export const couponSchema = zod.object({

  code : zod.string(),
  discount : zod.number(),
  acive : zod.boolean()

})


export const editCouponSchema = zod.object({

   code : zod.string().optional(),
   discount : zod.number().optional(),
   active : zod.boolean().optional()
}).strict()

