import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    }catch(err){
        console.log("error occured while connecting to db")
    }
}

export {connectDB};