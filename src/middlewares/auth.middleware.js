import { JWT_SECRET } from "../config/serverConfig";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/CustomError";

import { StatusCodes } from "http-status-codes";

import jwt from "jsonwebtoken"

import User from "../models/user.schema"

export const isLoggedIn = asyncHandler(async (req,res,next) => {

    let token;

    if(req.cookies.token || (req.headers.Authorization && req.headers.Authorization.startsWith("Bearer")))
    {
       token = req.cookies.token || req.headers.Authorization.split()[1]

    }
    else
    throw new CustomError("Please login again",StatusCodes.BAD_REQUEST)

    try {

        const decodedJwtPayload =  jwt.verify(token,JWT_SECRET)

        const user = await User.findOne({_id : decodedJwtPayload._id},{name : 1,email : 1,role : 1})

        req.user = user

        next()

     }
     catch(error){
     throw error
     }


})

export const authorize = (...requiredRoles) => asyncHandler(async (req,res,next) => {
    
     if(!requiredRoles.includes(req.user.role))
        throw new CustomError("You are not authorized to access this resource",StatusCodes.BAD_REQUEST)
     next()
})


// note : only add this authorize middleware after the isLoggedIn


// In the request headers =>  Authorization : Bearer <token>



