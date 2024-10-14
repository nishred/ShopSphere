import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
      name : {
         type : String,
         required : ["true","Please provide a name"],
         trim : true,
         maxLength : [120, "Product name shouldn't exceed 120 chars"]
      },

      price : {

        type : Number,
        required : ["true","please provide a price"],
      },
      description : {
        type : String
      },

      photos : [{

         secure_url : {
            type : String,
            required : true
         }

      }],
      stock : {

        type : Number,
        default : 0

      },
      sold : {

        type : Number,
        default : 0

      },

      collectionId : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "Collection"
      }

},{
   timestamps : true 
})


export default mongoose.model("Product",productSchema)