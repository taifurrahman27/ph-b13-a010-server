import express from "express";
import { connectDB } from "../lib/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const db = await connectDB();

        const ebooks = await db
            .collection("ebooks")
            .find({})
            .sort({ dateUploaded: -1 })
            .toArray();

        res.send(ebooks);
    } catch (error) {
        res.status(500).send({
            message: "Failed to load ebooks",
        });
    }
});

export default router;