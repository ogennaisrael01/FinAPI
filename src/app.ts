import "dotenv/config";
import "./queue/workers";
import express from "express";
import { createServer } from "node:http";
import morgan from "morgan";
import { logger } from "./logger";
import { baseError } from "./middleware/errorMiddleWare";
import { termiiService } from "./providers/termii/state";
import { router as userRouter } from "./modules/user/user.routes";



const app = express();
app.use(express.json())
app.use("/api/fin", userRouter)

const morganStram = {write: (message: string) => logger.info(message.trim())}
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {stream: morganStram}))
app.use(baseError)

function startServer() {
    const server = createServer(app)
    const port = Number(process.env.PORT) || 3000

    server.listen(port, "0.0.0.0", () => {
        logger.info(`Server Running on port ${port}`)
    })
}

startServer();

app.use("/send", (req, res) => {
    const message = termiiService.sendMessage("2348142550239", "123456", "dnd")
    return res.status(200).json(message)
})