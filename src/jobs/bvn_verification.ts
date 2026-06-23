import { UserRepository } from "../modules/user/user.repository";
import { BVNJobData } from "../queue/types";


export async function processBVNverification(data: BVNJobData) {
    const user = await new UserRepository().findUserById(data.userId)

}