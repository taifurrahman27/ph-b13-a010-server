import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/admin", async (req, res) => {
    try {
        const db = await connectDB();

        const users = await db.collection("users").countDocuments();

        const writers = await db.collection("users").countDocuments({
            role: "writer",
        });

        const purchases = await db
            .collection("purchases")
            .find({
                paymentStatus: "Paid",
            })
            .toArray();

        const ebooksSold = purchases.length;

        const revenue = purchases.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );

        const ebooks = await db.collection("ebooks").find().toArray();

        const genreMap = {};

        ebooks.forEach((ebook) => {
            genreMap[ebook.genre] =
                (genreMap[ebook.genre] || 0) + 1;
        });

        const genreData = Object.entries(genreMap).map(
            ([name, value]) => ({
                name,
                value,
            })
        );

        const monthMap = {};

        purchases.forEach((purchase) => {
            const month = new Date(
                purchase.createdAt
            ).toLocaleString("en-US", {
                month: "short",
            });

            monthMap[month] =
                (monthMap[month] || 0) + purchase.amount;
        });

        const salesData = Object.entries(monthMap).map(
            ([month, revenue]) => ({
                month,
                revenue,
            })
        );

        res.json({
            stats: {
                users,
                writers,
                ebooksSold,
                revenue,
            },
            salesData,
            genreData,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to load analytics",
        });
    }
});







export default router;

