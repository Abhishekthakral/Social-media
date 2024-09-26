import mongoose from 'mongoose'

const ListingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    Image:{
        type:String,
        required:true,
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comments"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})


export const Listing=mongoose.model("Listing",ListingSchema)