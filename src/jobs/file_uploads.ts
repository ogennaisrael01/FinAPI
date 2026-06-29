import { logger } from "../logger";
import { UserService } from "../modules/user/user.services";
import { cloudinaryUpload } from "../providers/cloudinary/config";
import { fileTypes } from "../queue/types";



export async function processFileUpload(userId: string, file: any, type: string, idType: string | null){
    try{
        logger.debug("uploading file...")
        const rawData = file.buffer?.data
        const fileBuffer = Buffer.from(rawData)
        const fileStr = `data:${file.mimetype};base64,${fileBuffer.toString("base64")}`
        const data = await cloudinaryUpload(fileStr)
        if (type === fileTypes.KYC_DOCUMENT){
            await new UserService().processKYCUpload(userId, data.secure_url, idType as string)
        }
        else if (type === fileTypes.PROFILE_PICTURE){
            await new UserService().savePicture(userId, data.secure_url, data.public_id)
        }
        logger.debug("file uploaded")
    }
    catch (error: any){
        logger.error(error.message)
        throw new Error(error.message)
    }
}