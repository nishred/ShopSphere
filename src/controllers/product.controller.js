import Product from "../models/product.schema.js"
import formidable from "formidable"
import { s3FileUpload, s3deleteFile} from "../service/imageUpload.js"
import Mongoose, { Collection } from "mongoose"
import asyncHandler from "../service/asyncHandler.js"
import CustomError from "../utils/CustomError.js"
import config, { S3_BUCKET_NAME } from "../config/serverConfig.js"
import fs from "fs"
import { StatusCodes } from "http-status-codes"
import { updateProductSchema } from "../validation/product.validator.js"
import { cookieOptions } from "./auth.controller.js"
import { rawListeners } from "process"


// // Amazon s3:
// You can think of it as a folder in the cloud, but with some added functionality and properties. Each object in an S3 bucket is uniquely identified by a key (the filename or path), and an S3 bucket can contain unlimited objects.

// Think of s3 as a container for key-value pairs. where key(unique indentifier) is the name of the object and value is the data(file content) of the object.

// In a web app where users upload profile pictures, the uploaded image is stored as an object in S3. The file’s key can be something like user123/profile_picture.png, where user123 is the user ID, and profile_picture.png is the file name.

/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can create the coupon
 * @descriptio Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/

// If the request has form data (like when sending data via HTML forms or with enctype="multipart/form-data"):
// The data sent is typically not in JSON format, but rather as form fields.
// You can use middleware like express.urlencoded() to parse this type of data.
// For file uploads (e.g., with form-data), you would use a specialized library like formidable to handle the parsing of the request.

// app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

// app.post('/submit', (req, res) => {
//   console.log(req.body); // This will contain form field data
//   res.send('Form data received');
// });

// const formidable = require('formidable');

// app.post('/upload', (req, res) => {
//   const form = new formidable.IncomingForm();
//   form.parse(req, (err, fields, files) => {
//     console.log(fields); // Form fields (non-file data)
//     console.log(files); // Uploaded files
//     res.send('File upload complete');
//   });
// });

export const addProduct = asyncHandler(async (req, res) => {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async function (err, fields, files){
        if (err) {
            throw new CustomError(err.message || "Something went wrong", 500)
        }

        let productId = new Mongoose.Types.ObjectId().toHexString()

        console.log(fields, files);

        if (
            !fields.name ||
            !fields.price ||
            !fields.description ||
            !fields.collectionId
        ) {
            throw new CustomError("Please fill all the fields", 500)
            
        }

        let imgArrayResp = Promise.all(
            Object.keys(files).map(async (fileKey, index) => {   
                
                
            //   {"image1": {
            //       "originalFilename": "smartphone-front.jpg",
            //       "filepath": "/tmp/upload_1234567890", // Temporary local path where the file is saved
            //       "size": 204800, // Size in bytes
            //       "mimetype": "image/jpeg"
            //     },
            //     "image2": {
            //       "originalFilename": "smartphone-back.jpg",
            //       "filepath": "/tmp/upload_0987654321", // Temporary local path
            //       "size": 195000,
            //       "mimetype": "image/jpeg"
            //     }
            //   }
              
                const element = files[fileKey]
                console.log(element);
                const data = fs.readFileSync(element.filepath)

                const upload = await s3FileUpload({
                    bucketName: config.S3_BUCKET_NAME,
                    key: `products/${productId}/photo_${index + 1}.png`,
                    body: data,
                    contentType: element.mimetype
                })

                // structure of the upload object 


                // {
                //     "ETag": "\"9c8af9a76df052144598c115dfdc2be7\"",
                //     "Location": "https://my-bucket.s3.amazonaws.com/uploads/my-file.txt",
                //     "Key": "uploads/my-file.txt",
                //     "Bucket": "my-bucket"
                //   }
                // productId = 123abc456
                // 1: products/123abc456/photo_1.png
                // 2: products/123abc456/photo_2.png

                console.log(upload);
                return {
                    secure_url : upload.Location
                }
            })
        )

        let imgArray = await imgArrayResp

        const product = await Product.create({
            _id: productId,
            photos: imgArray,
            ...fields
        })

        if (!product) {
            throw new CustomError("Product failed to be created in DB", 400)
        }
        res.status(200).json({
            success: true,
            product,
        })
    
    })
})

export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})

export const getProductById = asyncHandler(async (req, res) => {
    const {id: productId} = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No product found", 404)
    }

    res.status(200).json({
        success: true,
        product
    })
})

export const getProductByCollectionId = asyncHandler(async(req, res) => {
    const {id: collectionId} = req.params

    const products = await Product.find({collectionId})

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})


export const deleteProduct = asyncHandler(async(req, res) => {
    const {id: productId} = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No product found", 404)

    }

    //resolve promise
    // loop through photos array => delete each photo
    //key : product._id

    const deletePhotos = Promise.all(
        product.photos.map(async( elem, index) => {
            await s3deleteFile({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${product._id.toString()}/photo_${index + 1}.png`
            })
        })
    )

    await deletePhotos;

    await product.remove()

    res.status(200).json({
        success: true,
        message: "Product has been deleted successfully"
    })
})


// work on the update controller

export const updateProduct = asyncHandler(async (req,res) => {

   const id = req.params.id


   const form = new formidable({multiples : true,keepExtensions : true})

   const product = await Product.findOne({_id : id})

   if(!product)
    throw new CustomError("The product doesn't exist",StatusCodes.BAD_REQUEST)


   form.parse(req,async (err,fields,files) => {

      if(files.length > 0)
      {

          let countImages = product.photos.length

          const arr = []

          for(let i=1;i<=countImages;i++)
            arr.push(i)

          const promiseArray =  Promsie.all(arr.map((index) => {
             return s3deleteFile({
                bucketName : S3_BUCKET_NAME,
                key : `products/${product._id}/photo_${index}`
             })
          }))

          await promiseArray

      
              const photos = await Promise.all(Object.keys(files).map(async (fileKey,idx) => {

                    const value = files[fileKey]
                     
                     return new Promise((reject,resolve) => {

                        try{


                        fs.readFile(value.filepath,"utf-8",async (err,data) => {

                            const upload = await s3FileUpload({
                              bucketName : S3_BUCKET_NAME,
                              key : `products/${product._id}/photo_${idx+1}`,
                              body : data,
                              contentType : value.mimetype

                            })

                            resolve({
                             secure_url  : upload.Location
                            })


                        })

                    }
                    catch(error)
                    {

                        reject(error)

                    }
                         

                     })

               }))


               
           const validatedProductFields = updateProductSchema.parse(fields)


          const collectionId = validatedProductFields.collectionId


          if(collectionId)
          {
               const isValid = await Collection.findOne({_id : collectionId})
               if(!isValid)
                throw new CustomError("Collection id is invalid",StatusCodes.BAD_REQUEST)
          }


          const updatedProduct = await Product.findByIdAndUpdate(product._id,{$set : {...validatedProductFields,photos}},{new : true})


           res.status(StatusCodes.ACCEPTED).json({
                success : true,
                message : "Product has been updated successfully",
                data : updatedProduct

           })


        }
       else {

   
        const validatedProductFields = updateProductSchema.parse(fields)

        const collectionId = validatedProductFields.collectionId


        if(collectionId)
        {

            const isCollectionIdValid = await Collection.findOne({_id : collectionId})

            if(!isCollectionIdValid)
                throw new CustomError("Collection Id is invalid",StatusCodes.BAD_REQUEST)

        }


        const updatedProduct = await Product.findByIdAndUpdate(id,{$set : {...validatedProductFields}},{new : true})


        res.status(StatusCodes.ACCEPTED).json({

           success : true,
           message : "The Product has been updated successfully",
           data : updatedProduct

        })



       }


   })


})



// Mental Model for Promise.all()
// Think of Promise.all() like a chef waiting for all dishes in the kitchen to finish cooking before serving the meal. If any one of the dishes burns or fails, the chef stops and doesn't serve any. This function is ideal when:

// Multiple promises need to be resolved (like preparing different dishes), and...
// You need all of them to either succeed or know if any one of them failed.
// How Promise.all() Works
// Promise.all() takes an array of promises as input.
// It waits for all of them to resolve.
// If all promises resolve successfully, it returns an array with the results of each promise (in the same order as the promises passed in).
// If any promise fails (rejects), it immediately rejects with the error of the failed promise and discards all others.
// When to Use Promise.all()
// 1. Fetching Multiple APIs Simultaneously
// Imagine you're building a weather dashboard that fetches data from different sources (e.g., temperature, humidity, wind speed). All these requests can happen simultaneously, and you don't want to display the dashboard until all the data is available.

// async function fetchWeatherData() {
//     const tempPromise = fetch('https://api.weather.com/temperature');
//     const humidityPromise = fetch('https://api.weather.com/humidity');
//     const windSpeedPromise = fetch('https://api.weather.com/windSpeed');
    
//     try {
//         const [temperature, humidity, windSpeed] = await Promise.all([tempPromise, humidityPromise, windSpeedPromise]);
//         console.log('Weather Data:', { temperature, humidity, windSpeed });
//     } catch (error) {
//         console.error('Failed to fetch weather data:', error);
//     }
// }
// Mental Model: You’re asking three friends to get you information from different sources. You only proceed when all of them come back with their results.

// 2. Batch Processing of Files
// Suppose you have a list of files to process, and each file requires some asynchronous operation (like reading from disk). You want to process them all at the same time and handle the result when everything is done.


// async function processFiles(fileList) {
//     const readPromises = fileList.map(file => readFileAsync(file));
    
//     try {
//         const fileContents = await Promise.all(readPromises);
//         console.log('Processed Files:', fileContents);
//     } catch (error) {
//         console.error('Error processing files:', error);
//     }
// }
// Mental Model: You’ve handed out files to several team members to process. The project won’t move forward until everyone has completed their work. If any one team member fails, the project halts.




// Why Use Promise.all()?

// Concurrency: All promises are executed at the same time. You don’t wait for one to finish before starting the next.

// Failure Handling: If one promise fails, Promise.all() immediately rejects. It’s useful when you depend on all promises succeeding.

// When to Avoid Promise.all()
// Independent results: If you don’t need all promises to succeed (e.g., one can fail without breaking the app), consider using Promise.allSettled().
// Dependent promises: If each promise depends on the result of the previous one, Promise.all() isn’t appropriate (you’d want to chain them instead).
// Conclusion
// Use Promise.all() when you need to wait for multiple asynchronous operations and proceed only if all of them succeed.
// It’s perfect when all promises can run in parallel and their success is critical for the next step.




