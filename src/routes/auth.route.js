import express from "express"
import { getProfile, login, logout, signUp } from "../controllers/auth.controller"
import { isLoggedIn } from "../middlewares/auth.middleware"


const authRouter = express.Router()


authRouter.post("/signup",signUp)

authRouter.post("/login",login)

authRouter.post("/logout",logout)

authRouter.get("/profile",isLoggedIn,getProfile)


export default authRouter

