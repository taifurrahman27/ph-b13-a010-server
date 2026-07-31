import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();


router.get("/admin", async (req, res) => {
    try {
        const db = await connectDB();

        const users = await db.collection("user").countDocuments();

        const writers = await db.collection("user").countDocuments({
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
                (monthMap[month] || 0) +
                Number(purchase.amount || 0);
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
        console.error("Analytics Error:", err);

        res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack,
        });
    }
});



router.get("/writer/:writerId", async (req, res) => {
    try {
        const { writerId } = req.params;
        const db = await connectDB();
        const ebooks = await db
            .collection("ebooks")
            .find({
                "writer.id": writerId,
            })
            .toArray();
        const purchases = await db
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
        const totalEbooks = ebooks.length;
        const totalSales = purchases.length;
        const totalRevenue = purchases.reduce(
            (sum, purchase) =>
                sum + Number(purchase.amount || 0),
            0
        );
        const averageRating =
            totalEbooks === 0
                ? 0
                : Number(
                    (
                        ebooks.reduce(
                            (sum, ebook) =>
                                sum + Number(ebook.rating || 0),
                            0
                        ) / totalEbooks
                    ).toFixed(1)
                );

        const monthMap = {};

        purchases.forEach((purchase) => {
            const month = new Date(purchase.createdAt).toLocaleString(
                "en-US",
                {
                    month: "short",
                }
            );

            monthMap[month] =
                (monthMap[month] || 0) +
                Number(purchase.amount || 0);
        });

        const salesData = Object.entries(monthMap).map(
            ([month, revenue]) => ({
                month,
                revenue,
            })
        );
        const recentSales = purchases
            .slice(0, 5)
            .map((purchase) => ({
                _id: purchase._id,
                ebookTitle: purchase.ebookTitle,
                customerEmail: purchase.customerEmail,
                amount: purchase.amount,
                createdAt: purchase.createdAt,
            }));
        const topBooks = [...ebooks]
            .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
            .slice(0, 5)
            .map((ebook) => ({
                title: ebook.title,
                sales: ebook.totalSales || 0,
                revenue: ebook.totalRevenue || 0,
            }));

        const ebookData = ebooks
            .map((ebook) => ({
                title: ebook.title,
                sales: ebook.totalSales || 0,
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        res.json({
            stats: {
                ebooks: totalEbooks,
                sales: totalSales,
                revenue: totalRevenue,
                averageRating: Number(averageRating.toFixed(1)),
            },
            salesData,
            ebookData,
            recentSales,
            topBooks,
        });

    } catch (error) {
        console.error("Writer Analytics Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
});





export default router;

