import express from "express"
import { authorize, isLoggedIn } from "../middlewares/auth.middleware"
import authRoles from "../utils/authRoles"
import { createCoupon, deleteCoupon, editCoupon, getCoupon, getCoupons } from "../controllers/coupon.controller"
const couponRouter = express.Router()


couponRouter.get("/",isLoggedIn,authorize(authRoles.ADMIN),getCoupons)

couponRouter.get("/:id",isLoggedIn,authorize(authRoles.ADMIN),getCoupon)

couponRouter.post("/",isLoggedIn,authorize(authRoles.ADMIN),createCoupon)

couponRouter.patch("/:id",isLoggedIn,authorize(authRoles.ADMIN),editCoupon)

couponRouter.delete("/:id",isLoggedIn,authorize(authRoles.ADMIN),deleteCoupon)



export default couponRouter