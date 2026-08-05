import { createRemoteJWKSet, jwtVerify } from "jose";


const jwksUrl = new URL(
    "/api/auth/jwks",
    process.env.BETTER_AUTH_CLIENT_URL
);


const JWKS = createRemoteJWKSet(jwksUrl);
export default async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const token = authHeader.split(" ")[1];


    try {
        const secret = new TextEncoder().encode(
            process.env.BETTER_AUTH_SECRET
        );

        const { payload } = await jwtVerify(token, JWKS);

        req.user = payload;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token",
            error: error.message,
        });
    }
}
