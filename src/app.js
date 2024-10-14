import express from "express"
import cors from "cors"

import cookieParser from "cookie-parser"
import router from "./routes"
import { StatusCodes } from "http-status-codes"


const app = express()

app.use(express.json())

app.use(express.urlencoded({extended : true}))

app.use(cors())

app.use(cookieParser())  //server can access the user's cookie


app.use("/api/v1",router)

app.all("*",(_req,res) => {

   res.status(StatusCodes.BAD_REQUEST).json({
      success : false,
      message : "Route not found"
   })

})



export default app