import express from "express";
import { connectDB } from "../lib/db.js";
import { ObjectId } from "mongodb";


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


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid ebook ID",
            });
        }

        const db = await connectDB();

        const ebook = await db.collection("ebooks").findOne({
            _id: new ObjectId(id),
        });

        if (!ebook) {
            return res.status(404).send({
                success: false,
                message: "Ebook not found",
            });
        }

        res.status(200).send(ebook);
    } catch (error) {
        console.error(error);

        res.status(500).send({
            success: false,
            message: "Failed to load ebook",
        });
    }
});

export default router;
