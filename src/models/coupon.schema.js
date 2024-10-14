import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

      code : {
      type : String,
      required : ["true","Please provide a code"]
   },

      discount : {
     type : Number,
     default : 0
   },

      active : {
     type : Boolean,
     default : true
     }
    },
    {

    timestamps : true

   })

    
   export default mongoose.model("Coupon",couponSchema)




//TODO : Write a coupon controller to add a new coupon, edit it, delete it and disable it