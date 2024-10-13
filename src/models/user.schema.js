import mongoose from "mongoose";
import authRoles from "../utils/authRoles";

import bcrypt from "bcryptjs"

import jwt from "jsonwebtoken"

import crypto from "crypto"


import { JWT_SECRET,JWT_EXPIRY } from "../config/serverConfig";


const userSchema = new mongoose.Schema({

    name : {type : String,
        required : ["true","Please enter the name"],
        maxLength : [50,"Name must be less than 50 chars"],
        trim : true
    },

    email : {
        type : String,
        required : ["true","Email is required"]
    },

    password : {
       type : String,
       required : ["true","Password can't be empty"],
       minLength : [8,"Password can't be less than 8 chars"],
       Select : false   //Password won't be retrieved automatically. Explicit mention needed
    },

    role : {
      type : String,
      enum : {
        values : Object.values(authRoles)
      },
      default : authRoles.USER
    },

    forgotPasswordToken : String,  // on users email we send a token. We have to temporarily save that token in the db for that user

    forgotPasswordExpiry : Date
 
},
{
    timestamps : true
})


//encrypt the password before saving

userSchema.pre("save",async function(next) 
{
  
   const user = this;
   
   if(!user.isModified("password"))
    return next()

   const hash = await bcrypt.hash(user.password,10)

   user.password = hash
   next()

})

//schema methods are methods that you define on schemas to perform operations on  document instances

userSchema.methods.comparePassword = async function(enteredPassword)
{
    const user = this
    const isValid = await bcrypt.compare(enteredPassword,user.password)
    return isValid
  
}


userSchema.methods.getJwtToken = function()
{
   const user = this
    const token =  jwt.sign({_id : user._id, role : user.role},JWT_SECRET,{expiresIn : JWT_EXPIRY})
    // hides the payload in the token
    return token
}


userSchema.methods.generateForgotPasswordToken = function()
{

   const user = this
   const forgotToken = crypto.randomBytes(20).toString("hex")
   user.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")   
   user.forgotPasswordExpiry = Date.now() + 20*60*1000

   return  forgotToken

}



export default mongoose.model("User",userSchema)