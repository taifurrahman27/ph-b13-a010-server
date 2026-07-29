import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const db = await connectDB();

        const purchases = await db
            .collection("purchases")
            .find({
                userId,
                paymentStatus: "complete",
            })
            .sort({
                purchasedAt: -1,
            })
            .toArray();

        if (purchases.length === 0) {
            return res.json([]);
        }

        const ebookIds = purchases.map(
            (purchase) => new ObjectId(purchase.ebookId)
        );

        const ebooks = await db
            .collection("ebooks")
            .find({
                _id: {
                    $in: ebookIds,
                },
            })
            .toArray();

        const purchasedEbooks = purchases.map((purchase) => {

            const ebook = ebooks.find(
                (book) =>
                    book._id.toString() === purchase.ebookId
            );

            return {
                ...ebook,
                purchaseDate: purchase.purchasedAt,
            };
        });

        res.json(purchasedEbooks);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load purchased ebooks.",
        });

    }
});

export default router;