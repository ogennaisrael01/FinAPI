import { Token } from "./tokens";

const jwtAlgorithm = (process.env.JWT_ALGORITHM ?? "HS256") as unknown as Algorithm;

export const tokenState = new Token(
    process.env.JWT_SECRET_KEY as string,
    jwtAlgorithm,
    process.env.ACCESS_TOKEN_TTL as string,
    process.env.REFRESH_TOKEN_TTL as string
)