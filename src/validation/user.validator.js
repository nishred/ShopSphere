import {zod} from "zod"

export const signUpSchema = zod.object({

    name : zod.string(),
    email : zod.string().email(),
    password : zod.string()

})


export const loginSchema = zod.object({

    email : zod.string().email(),
    password : zod.string()


})