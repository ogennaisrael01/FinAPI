import { Job, Worker } from "bullmq";
import { redisClient } from "./redis.config";
import { logger } from "../logger";
import { BVNJobData, FileJobData, JobNames } from "./types";
import { processSMS } from "../jobs/sms";
import { processEmail } from "../jobs/email";
import { processFileUpload } from "../jobs/file_uploads";
import { processBVNverification } from "../jobs/bvn_verification";

export function worker (){
    const task = new Worker("task-processing", async (job: Job) => {
        logger.info(`Processing job ${job.id} of type ${job.name}`)
        const jobName = job['name']
        if (!Object.values(JobNames).includes(jobName)) {
            logger.error(`Job name ${jobName} is not defined in JobNames`)
            throw new Error(`Job name ${jobName} is not defined in JobNames`)
        }
        if (jobName === JobNames.SEND_SMS) {
            logger.debug("Processing send_sms job", {meta: `Job ID: ${job.id}`})
            const phone = job.data.phone
            const code = job.data.code
            if (!phone || !code) {
                logger.error(`Job data is missing userId or code for job ${job.id}`)
                throw new Error(`Job data is missing userId or code for job ${job.id}`)
            }
            await processSMS(phone, code)
        }
        else if (jobName === JobNames.SEND_EMAIL) {
            logger.debug("Processing send_email job", {meta: `Job ID: ${job.id}`})
            const email = job.data.email
            const code = job.data.code
            if (!email || !code) {
                logger.error(`Job data is missing email or code for job ${job.id}`)
                throw new Error(`Job data is missing email or code for job ${job.id}`)
            }
            await processEmail(email, code)
        }

        else if (jobName === JobNames.FILE_UPLOAD){
            logger.debug("Processing file_upload job", {meta: `Job ID: ${job.id}`})
            const data: FileJobData = job.data
            if (!data.userId || !data.file){
                logger.error(`Job data is missing userId or file for job $${job.id}`)
                throw new Error("Job data is missing userId or file "+ job.id)
            }
            await processFileUpload(data.userId, data.file, data.type, data.idType)
        }
        else if (jobName === JobNames.BVN_VERIFICATION){
            logger.debug("Procesing Bvn verification", {meta: {joId: job.id, userId: job.data.userId}})
            const data = job.data.userId && job.data.bvn ? job.data : new Error("userId and BVN cannot be empty")
            await processBVNverification(data as BVNJobData)
        }

    }, {connection: redisClient as any, concurrency: 5})

    task.on("completed", (job: Job) => {
        logger.info(`Job ${job.id} of type ${job.name} has been completed`)
    });
    task.on("failed", (job: any, err: any) => {
        logger.error(`Job ${job.id} of type ${job.name} has failed with error: ${err.message}`)
    })

    return task
}