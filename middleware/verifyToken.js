import { createRemoteJWKSet, jwtVerify } from "jose";


const jwksUrl = new URL(
    "/api/auth/jwks",
    process.env.BETTER_AUTH_CLIENT_URL
);

console.log(jwksUrl.href);

const JWKS = createRemoteJWKSet(jwksUrl);
export default async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log(authHeader, 'authheader from verify token');

    if (!authHeader) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const token = authHeader.split(" ")[1];
    console.log(token, "token from verify token");


    try {
        const secret = new TextEncoder().encode(
            process.env.BETTER_AUTH_SECRET
        );

        const { payload } = await jwtVerify(token, JWKS);
        console.log(payload, "payload from jwtverify");

        req.user = payload;

        next();

    } catch (error) {
        console.error("JWT Verify Error:", error);

        return res.status(401).json({
            message: "Invalid token",
            error: error.message,
        });
    }
}
