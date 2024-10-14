import express from "express"
import cors from "cors"

import cookieParser from "cookie-parser"
import router from "./routes"


const app = express()

app.use(express.json())

app.use(express.urlencoded({extended : true}))

app.use(cors())

app.use(cookieParser())  //server can access the user's cookie


app.use("/api/v1",router)


export default app