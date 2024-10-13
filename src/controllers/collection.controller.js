import { StatusCodes } from "http-status-codes"
import Collection from "../models/collection.schema"
import asyncHandler from "../service/asyncHandler"
import CustomError from "../utils/CustomError"


export const createCollection = asyncHandler(async (req,res) => {

   const {name} = req

   if(!name)
    throw new CustomError("Collection name is required",StatusCodes.BAD_REQUEST)

   const collection = new Collection({name : name})
   const savedCollection = await collection.save()
   res.status(StatusCodes.CREATED).json({
    
      success : true,
      message : "Collection created successfully",
      data : savedCollection
   })

})


export const updateCollection = asyncHandler(async (req,res) => {

     const {id : collectionId} = req.params

     const {name} = req.body

     if(!name)
        throw new CustomError("No update fields provided",StatusCodes.BAD_REQUEST)

     const updatedCollection = await Collection.findByIdAndUpdate(collectionId,{name},{new : true,runValidators : true}) 

     // Model.findByIdAndUpdate(id,update,options)
     if(!updateCollection)
        throw new CustomError("Collection id is invalid",StatusCodes.BAD_REQUEST)
     
     res.status(StatusCodes.ACCEPTED).json({

       success : true,
       message : "Collection updated successfully",
       data : updatedCollection

     })

})


export const deleteCollection = asyncHandler(async (req,res) => {

  const {id : collectionId} = req.params

  const deletedCollection = await Collection.findByIdAndDelete(collectionId)

  if(!deleteCollection)
    throw new CustomError("Invalid collection id",StatusCodes.BAD_REQUEST)


  res.status(StatusCodes.ACCEPTED).json({
    success : true,
    message : "Collection has been deleted successfully",
    data : deleteCollection

  })
  
})











