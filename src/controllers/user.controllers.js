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
    const isPasswordcorrect=user.isPasswordCorrect(password);
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
})



export {registerUser,UploadImage,LoginUser}