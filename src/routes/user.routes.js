import { Router } from "express";
import { registerUser,UploadImage,LoginUser} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjWT } from "../middlewares/auth.middleware.js";


const userRouter=Router();

userRouter.route("/register").post(registerUser)
userRouter.route("/uploadImage").post(verifyjWT,
    upload.fields([
        {
            name:"Image",
            maxCount:1
        }
    ]),UploadImage
)
userRouter.route("/login").post(LoginUser)


export {userRouter}