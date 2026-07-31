import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const db = await connectDB();

        const transactions = await db
            .collection("purchases")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(transactions);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load transactions.",
        });
    }
});







export default router;

