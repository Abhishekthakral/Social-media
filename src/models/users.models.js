import mongoose from 'mongoose'

import bcrypt from 'bcrypt'

import jwt from 'jsonwebtoken'

//taking fullname,username,bio,images[array],password,email,timestamps,

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        lowercase:true
    },
    bio:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password=await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect=async function(password){
    return bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=async function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESSTOKEN_SECRET,
        {
            expiresIn:process.env.ACCESSTOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this.id
    },
    process.env.REFERSHTOKEN_SECRET,
    {
        expiresIn:process.env.REFERSHTOKEN_EXPIRY
    }
    )
}

export const User=mongoose.model('User',userSchema);