import { Queue } from "bullmq";
import { redisClient } from "./redis.config";

function queue(){
    const queueTasks = new Queue("task-processing", { connection: redisClient as any, defaultJobOptions: {
        attempts: 5, removeOnComplete: true, removeOnFail: false, backoff: {type: "exponential"}
    }})
    return queueTasks
}

export const queueClient = queue()