import mongoose from 'mongoose'

const CommentSchema=new mongoose.Schema({
    text:{
        type:String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Comments=mongoose.model("Comments",CommentSchema);