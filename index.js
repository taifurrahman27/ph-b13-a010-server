import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { ObjectId } from "mongodb";
import ebookRoutes from "./routes/ebooks.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import purchaseRoutes from "./routes/purchases.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());

app.use(cookieParser());

await connectDB();

app.use("/ebooks", ebookRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/users", userRoutes);

app.get("/writers", async (req, res) => {
    try {
        const db = await connectDB();

        const ebooks = await db.collection("ebooks").find().toArray();

        const writersMap = {};

        ebooks.forEach((ebook) => {
            const writer = ebook.writer;

            if (!writer) return;

            if (!writersMap[writer.id]) {
                writersMap[writer.id] = {
                    id: writer.id,
                    name: writer.name,
                    email: writer.email,
                    photo: writer.photo,
                    totalBooks: 0,
                    totalSales: 0,
                };
            }

            writersMap[writer.id].totalBooks += 1;
            writersMap[writer.id].totalSales += ebook.totalSales || 0;
        });

        res.json(Object.values(writersMap));
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to load writers",
        });
    }
});


app.get("/writers/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const db = await connectDB();

        // Get all ebooks by this writer
        const ebooks = await db
            .collection("ebooks")
            .find({ "writer.id": id })
            .toArray();

        if (ebooks.length === 0) {
            return res.status(404).json({
                message: "Writer not found",
            });
        }

        const writer = ebooks[0].writer;

        const totalBooks = ebooks.length;

        const totalSales = ebooks.reduce(
            (sum, ebook) => sum + (ebook.totalSales || 0),
            0
        );

        const averageRating =
            ebooks.reduce((sum, ebook) => sum + (ebook.rating || 0), 0) /
            totalBooks;

        res.json({
            writer: {
                id: writer.id,
                name: writer.name,
                email: writer.email,
                photo: writer.photo,
                totalBooks,
                totalSales,
                averageRating: Number(averageRating.toFixed(1)),
            },
            ebooks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to load writer details",
        });
    }
});


app.get("/writers/:id/ebooks", async (req, res) => {
    try {
        const { id } = req.params;

        const db = await connectDB();

        const ebooks = await db
            .collection("ebooks")
            .find({
                "writer.id": id,
            })
            .sort({
                createdAt: -1,
            })
            .toArray();

        res.status(200).json({
            success: true,
            count: ebooks.length,
            ebooks,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load writer ebooks.",
        });
    }
});






app.get("/", (req, res) => {
    res.send("Fable Server Running...");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
