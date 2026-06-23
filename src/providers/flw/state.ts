import { FlutterWave } from "./flw.services";


export const flw = new FlutterWave(
    process.env.FLW_BASE_URL as string, process.env.FLW_CLIENT_ID as string,
    process.env.FLW_CLIENT_SECRET_KEY as string

)

export function generateUniqueReference(username: string){
    // extract the first four letters from username
    const append = username ? username.slice(0, 4).toUpperCase() : "REFE"
    return append + "-" + crypto.randomUUID()
}   