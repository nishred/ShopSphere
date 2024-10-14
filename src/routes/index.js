import express from "express"
import authRouter from "./auth.route"
import couponRouter from "./coupon.route"


const router = express.Router()

router.use("/auth",authRouter)

router.use("/coupon",couponRouter)



export default router

