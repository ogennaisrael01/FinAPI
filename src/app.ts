import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import morgan from "morgan";
import { logger } from "./logger";
import { ErrorHandleMiddleWare } from "./middleware/errorMiddleWare";
import { router as userRouter } from "./modules/user/user.routes";
import { worker } from "./queue/workers";
import { prisma } from "./prisma";
import { processCreateVirtualAccount } from "./jobs/payments";
import { router as walletRouter } from "./modules/wallets/routers";


const workerInstance = worker() 
const app = express();
app.use(express.json())
app.use("/api/fin", userRouter)
app.use("/api/fin", walletRouter)

const morganStram = {write: (message: string) => logger.info(message.trim())}
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {stream: morganStram}))
app.use(ErrorHandleMiddleWare)

function startServer() {
    const server = createServer(app)
    const port = Number(process.env.PORT) || 3000

    server.listen(port, "0.0.0.0", () => {
        logger.info(`Server Running on port ${port}`)
    })
}

startServer();

app.use("/send", async (req, res) => {
    
    const userId = "10252e16-e182-4b38-9f89-688a78108323"
    const user = await prisma.user.findFirst({where: {id: userId}})
    const message = await processCreateVirtualAccount(user?.id as any, "22709965620")
    return res.status(200).json(message)
})