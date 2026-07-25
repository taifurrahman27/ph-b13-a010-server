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





app.get("/", (req, res) => {
    res.send("Fable Server Running...");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});