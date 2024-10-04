import { Router } from "express";
import { registerUser,UploadImage,LoginUser, LogoutUser, changePassword,updateDetails, searchUser, getCurrentUser} from "../controllers/user.controllers.js";
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
userRouter.route("/logout").post(verifyjWT,LogoutUser)
userRouter.route("/changePassword").post(verifyjWT,changePassword)
userRouter.route("/edit details").post(verifyjWT,updateDetails)
userRouter.route("/search").post(searchUser)
userRouter.route("/profile").post(verifyjWT,getCurrentUser)


export {userRouter}