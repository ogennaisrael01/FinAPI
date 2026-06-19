import { FlutterWave } from "./flw.services";


export const flw = new FlutterWave(
    process.env.FLW_BASE_URL as string, process.env.FLW_CLIENT_ID as string,
    process.env.FLW_CLIENT_SECRET_KEY as string

)