import { User } from "../models/users.models.js";
import ApiError from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import {uploadOnCloud} from "../utils/Cloudinary.js";
import {Listing} from '../models/listings.models.js'

const generateAccessAndRefereshTokens=async(userid)=>{
    try {
        const user=await User.findById(userid);
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400,"failed to create access and refresh tokens");
    }

}

const registerUser=asyncHandler(async(req,res)=>{
     //get user details 
    //validation-not empty
    //check if user already exist:username ,email
    //create user object-create entry in db
    //remove pass and referesh token field from response
    //check for user creation
    //return res
    const {userName,fullName,password,email,bio}=req.body;
    if(!(userName&&fullName&&password&&email)){
        throw new ApiError(400,"please fill all fields")
    }
    const existUser=await User.findOne({
            $or:[
                {userName},
                {email}
            ]
        }
    )
    if(existUser){
        throw new ApiError(400,"user already exist")
    }
    const user=await User.create({
        userName,fullName,email,password,bio
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(404,"failed to create user")
    }

    res.status(200)
    .json(
        new ApiResponse(200,createdUser,"user created successfully")
    )

});
const UploadImage=asyncHandler(async(req,res)=>{
    //get title,image from user
    //save it in locals using multer
    //upload on cloud
    //save url in listing schema
    const {title}=req.body;
    if(!title){
        throw new ApiError(400,"title is required")
    }
    const ImageLocalPath=req.files?.Image[0]?.path;
    if(!ImageLocalPath){
        throw new ApiError(400,"failed to fetch image")
    }
    const cloudImage=await uploadOnCloud(ImageLocalPath);

    if(!cloudImage){
        throw new ApiError(400,"failed to upload image on cloud")
    }
    //save image url in listing schema
    const listing=await Listing.create({
        title:title,
        Image:cloudImage.url,
        owner:req.user._id
    })
    const createdListing=await Listing.findById(listing._id);
    res.status(200)
    .json(new ApiResponse(200,createdListing,"image uploaded successfully"))
});
const LoginUser=asyncHandler(async(req,res)=>{
     // req.body -> data 
    // username or email 
    //find the user 
    //password check
    //access and referesh token
    //send cookie
    //send res
    const {userName,email,password}=req.body;
    if(!userName&&!email){
        throw new ApiError(400,"username or email is required")
    }
    const user=await User.findOne({
        $or:[{userName},{email}]
    })
    if(!user){
        throw new ApiError(400,"user does not exist")
    }
    const isPasswordcorrect=await user.isPasswordCorrect(password);
    if(!isPasswordcorrect){
        throw new ApiError(400,"password is incorrect");
    }
    //generating access and refersh tokens
    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id);
    // console.log(accessToken);
    // console.log(refreshToken);
    //user loggedin
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //sending cookies
    const options={
        httpOnly:true,
        secure:true,
    }
    //sending response
    res.status(200)
    .cookie("accesstoken",accessToken,options)
    .cookie("refreshtoken",refreshToken,options)
    .json(new ApiResponse(200,{loggedInUser,accessToken,refreshToken},"user loggedin successfully"));
});
const LogoutUser=asyncHandler(async(req,res)=>{
    //delete refresh tokens from user data 
    //clear cookies from browser
    const user=User.findById(
        req.user?._id)
    if(!user){
        throw new ApiError(400,"invalid request");
    }
    user.refreshToken=""

    const options={
        httpOnly:true,
        secure:true,
    }
    //clear cookies from browser
    res.status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(new ApiResponse(200,"user logout successfully"))
});
const changePassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body
    const user=await User.findById(req.user._id)
    if(!user){
        throw new ApiError(400,"fail to find user")
    }
    const checkpassword=await user.isPasswordCorrect(oldpassword)
    if(!checkpassword){
        throw new ApiError(400,"invalid old password")
    }
    user.password=newpassword;
    await user.save({validateBeforeSave:false})
    res.status(200)
    .json(new ApiResponse(200,user,"password changed success"))
})
const updateDetails=asyncHandler(async(req,res)=>{
//geting updated value from user
//update values in database 
//do this after verify jwt tokens 
const {fullName,bio,email}=req.body
if(!(fullName||bio||email)) return null
const user=await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            fullName,
            bio,
            email
        }
    },
    {
        new:true
    }
).select("-password ")
res.status(200)
.json(200,user,"changes done successfully")
})
const searchUser=asyncHandler(async(req,res)=>{
    //get username from user
    //find username from database
    //if user exist return user else throw error 
    const {userName}=req.body;
    const serchedUser=await User.findOne({userName}).select("-password -refreshToken -_id")
    if(!searchUser){
      throw new ApiError(400,"user not found")   
    }
    res.status(200)
    .json(
        new ApiResponse(200,serchedUser,"user found")
    )
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    //get current user details from tokens
    //verify if user login or not
    //return user
    const user=await User.findById(req.user?._id).select("-password -refreshToken -_id")
    if(!user){
        throw new ApiError(401,"login before visiting profile")
    }
    res.status(200)
    .json(new ApiResponse(200,user,"user profile success"));
})



export {registerUser,UploadImage,LoginUser,LogoutUser,changePassword,updateDetails,searchUser,getCurrentUser}