import { Router } from "express";
import { UserControllers } from "./user.controllers";

export const router = Router();

router.post("/register", new UserControllers().register)