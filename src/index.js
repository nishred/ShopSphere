import mongoose from "mongoose"

import { DB_URL,PORT} from "./config/serverConfig.js"

import app from "./app.js"

(async () => {

   try{

     await mongoose.connect(DB_URL)
     console.log("DB connected")

     app.on("error",(err) => {
 
       console.error("ERROR ",err)

       throw err

     })   //The db is connected and the express app doesn't have any trouble talking to it.


     const onListening = () => {

       console.log(`App is listening on PORT ${PORT}`)

     }

     app.listen(PORT,onListening)


   }
   catch(err)
   {
     console.error("ERROR: ",err)
     throw err
   }

})()




