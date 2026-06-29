import { Router } from "express";
import { UserControllers } from "./user.controllers";
import { AuthenticationMiddleware } from "../../middleware/AuthenticationMiddleware";
import { upload } from "../../providers/cloudinary/config";
import { IdempotencyKeyMiddleWare } from "../../middleware/errorMiddleWare";
import { Cache } from "../../middleware/cacheMiddleware";

export const router = Router();

router.post("/register", new UserControllers().register)
router.post("/verify", new UserControllers().verify)
router.post("/verification-email", AuthenticationMiddleware, new UserControllers().verificationEmail)
router.post("/account-setup", upload.single("Identity"), IdempotencyKeyMiddleWare, AuthenticationMiddleware, new UserControllers().onboard)
router.post("/login", new UserControllers().login)
router.post("/bvn/verification", AuthenticationMiddleware, new UserControllers().requestBvn)
router.post("/set-pin", AuthenticationMiddleware, new UserControllers().setPin)
router.get("/profile", AuthenticationMiddleware, Cache(300), new UserControllers().profile)
router.patch("/profile", AuthenticationMiddleware, new UserControllers().patchProfile)
router.post("/resend-code", new UserControllers().resendCode)
router.patch('/profile/picture', AuthenticationMiddleware, upload.single('file'), new UserControllers().picture)
router.get("/account-limits", AuthenticationMiddleware, Cache(300), new UserControllers().account)