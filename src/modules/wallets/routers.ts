
import { Router } from "express";
import { AuthenticationMiddleware } from "../../middleware/AuthenticationMiddleware";
import { WalletControllers } from "./controllers";
import { Cache } from "../../middleware/cacheMiddleware";


export const router = Router();

router.get("/wallet", AuthenticationMiddleware, Cache(60), new WalletControllers().wallet)