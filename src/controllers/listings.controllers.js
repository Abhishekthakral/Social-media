import ApiError from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import {uploadOnCloud} from "../utils/Cloudinary.js";
import {Listing} from '../models/listings.models.js';

const allListings=asyncHandler(async(req,res)=>{
    //find all listings from db
    //return all listings 
    const all=await Listing.find({})
    //check all if not nothing to watch
    if(!all.length){
        throw new ApiError(400,"nothing to watch")
    }
    res.status(201)
    .json(
        new ApiResponse(200,all,"all available listings")
    )
})

export {allListings};