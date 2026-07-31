import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/:writerId", async (req, res) => {
    try {
        const { writerId } = req.params;

        const db = await connectDB();

        const sales = await db
            .collection("purchases")
            .find({
                writerId,
                paymentStatus: "Paid",
                type: "purchase",
            })
            .sort({
                createdAt: -1,
            })
            .toArray();

        res.json(sales);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load sales.",
        });
    }
});



export default router;