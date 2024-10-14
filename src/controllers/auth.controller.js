import { signUpSchema,loginSchema } from "../validation/user.validator";
//sign up a new user
import asyncHandler from "../service/asyncHandler";

import User from "../models/user.schema"
import CustomError from "../utils/CustomError";

import { StatusCodes } from "http-status-codes";

export const cookieOptions = {
   expires : new Date(Date.now()) + 3 * 24 * 60 * 60 * 1000,
   httpOnly : true // makes the cookie read only on the client side, so now the user can see the cookie and he can't manipulate it
}


export const signUp = asyncHandler(async (req,res) => {
 
     const validatedUser = signUpSchema.parse(req.body)
 
      //check if user already exists in the db
      
      const existingUser = await User.findOne({email : validatedUser.email})

      if(existingUser)
        throw new CustomError("user already exists",StatusCodes.BAD_REQUEST)
     
      const user = new User(validatedUser)

      await user.save()

      const token = user.getJwtToken()

      //safety
      user.password = undefined  // as even if select is false, when the document is created for the firsttime, everything is returned

      //store the token in a cookie

      res.cookie("token",token,cookieOptions)

      res.status(StatusCodes.CREATED).json({
         success : true,
         token,
         data : user
      })
})


export const login = asyncHandler(async (req,res) => {

    const validatedDetails = loginSchema.parse(req.body)

    const user = User.findOne({email : validatedDetails.email}).select("+password")

    if(!user)
      throw new CustomError("Invalid credentials",StatusCodes.BAD_REQUEST)


    const isPasswordValid = await user.comparePassword(validatedDetails.password)

    if(!isPasswordValid)
      throw new CustomError("Password Incorrect",StatusCodes.BAD_REQUEST)

    user.password = undefined

    const token = user.getJwtToken()

    res.cookie("token",token,cookieOptions)


    res.status(StatusCodes.ACCEPTED).json({

       success : true,
       message : "Login successfull",
       token,
       data : user

    })

})


export const logout = asyncHandler(async (req,res) => {

   res.cookie("token",null,{
     expires : new Date(Date.now()),
     httpOnly : true
      
   })

   res.status(StatusCodes.ACCEPTED).json({

      success : true,
      message : "Loggged out successfully"

   })


})

// zod throws an error of type ZodError


export const getProfile = asyncHandler(async (req,res) => {


  const {user} = req;

  if(!user)
    throw new CustomError("Please login",StatusCodes.BAD_REQUEST)

  res.status(StatusCodes.ACCEPTED).json({
     success : true,
     data : user
  })

})
