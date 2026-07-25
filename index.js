import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import ebookRoutes from "./routes/ebooks.js";


const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());

app.use(cookieParser());

await connectDB();

app.use("/ebooks", ebookRoutes);

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





app.get("/", (req, res) => {
    res.send("Fable Server Running...");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});