import { Router } from "express";
import {allListings} from "../controllers/listings.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjWT } from "../middlewares/auth.middleware.js";

const listingRouter=Router();

listingRouter.route('/').get(allListings);




export {listingRouter};
