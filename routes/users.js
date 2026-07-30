import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const db = await connectDB();

        const users = await db
            .collection("user")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(users);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load users",
        });
    }
});

export default router;

