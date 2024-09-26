import ApiError from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/users.models.js";

export const verifyjWT=async(req,res,next)=>{
    // console.log(req.cookies)
       try {
         const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","");
         if(!token){
             throw new ApiError(400,"please login to access this resource")
         }
         const decodedToken=jwt.verify(token,process.env.ACCESSTOKEN_SECRET)
         // if(!decodedToken){
         //     throw new ApiError(400,"invalid token");
         // }
         const user=await User.findById(decodedToken?._id);
         req.user=user
         next();
       } catch (error) {
        throw new ApiError(200,"invalid user")
       }
}