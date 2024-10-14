import mongoose from "mongoose";


const collectionSchema  = new mongoose.Schema({

    name : {

        type : string,
        required : ["true","Please provide a product collection name"],
        trim : true,
        maxLength : [120, "Collection name should not be more than 120 chars"]
        
         }
},
{

   timestamps : true

})

export default mongoose.model("Collection",collectionSchema)   


// in the db the the name of the collection becomes lower case and plural



