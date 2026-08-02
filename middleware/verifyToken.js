import { jwtVerify } from "jose";

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

        const { payload } = await jwtVerify(token, secret);

        req.user = payload;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}
