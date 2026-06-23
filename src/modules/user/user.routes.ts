import { Router } from "express";
import { UserControllers } from "./user.controllers";
import { AuthenticationMiddleware } from "../../middleware/AuthenticationMiddleware";
import { upload } from "../../providers/cloudinary/config";
import { IdempotencyKeyMiddleWare } from "../../middleware/errorMiddleWare";

export const router = Router();

router.post("/register", new UserControllers().register)
router.post("/verify", new UserControllers().verify)
router.post("/verification-email", AuthenticationMiddleware, new UserControllers().verificationEmail)
router.post("/account-setup", upload.single("Identity"), IdempotencyKeyMiddleWare, AuthenticationMiddleware, new UserControllers().onboard)
router.post("/login", new UserControllers().login)
router.post("/bvn/request/verification", AuthenticationMiddleware, new UserControllers().requestBvn)
router.post("/set-pin", AuthenticationMiddleware, new UserControllers().setPin)