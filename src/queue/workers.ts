import { Job, Worker } from "bullmq";
import { any } from "zod";
import { redisClient } from "./redis.config";
import { logger } from "../logger";
import { JobNames } from "./types";
import { processSMS } from "../jobs/sms";


export function worker (){
    const task = new Worker("task-processing", async (job: Job) => {
        logger.info(`Processing job ${job.id} of type ${job.name}`)

        const jobName = job['name']
        if (!(jobName in JobNames)) {
            logger.error(`Job name ${jobName} is not defined in JobNames`)
            throw new Error(`Job name ${jobName} is not defined in JobNames`)
        }
        if (jobName === JobNames.SEND_SMS) {
            const userId = job.data.userId
            const code = job.data.code
            if (!userId || !code) {
                logger.error(`Job data is missing userId or code for job ${job.id}`)
                throw new Error(`Job data is missing userId or code for job ${job.id}`)
            }

            await processSMS(userId, code)
        }

    }, {connection: redisClient as any, concurrency: 5})
}