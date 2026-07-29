import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../lib/db.js";

const router = express.Router();


router.post("/", async (req, res) => {
    try {
        const db = await connectDB();

        const { userId, ebookId } = req.body;

        if (!userId || !ebookId) {
            return res.status(400).json({
                success: false,
                message: "userId and ebookId are required.",
            });
        }

        // Prevent duplicate bookmarks
        const exists = await db.collection("bookmarks").findOne({
            userId,
            ebookId,
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Already bookmarked.",
            });
        }

        const result = await db.collection("bookmarks").insertOne({
            userId,
            ebookId,
            createdAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: "Bookmarked successfully.",
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to bookmark ebook.",
        });
    }
});



router.get("/user/:userId", async (req, res) => {
    try {
        const db = await connectDB();

        const { userId } = req.params;

        const bookmarks = await db
            .collection("bookmarks")
            .find({ userId })
            .toArray();

        const ebookIds = bookmarks.map(
            (bookmark) => new ObjectId(bookmark.ebookId)
        );

        const ebooks = await db
            .collection("ebooks")
            .find({
                _id: {
                    $in: ebookIds,
                },
            })
            .toArray();

        res.json(ebooks);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load bookmarks.",
        });
    }
});


router.delete("/", async (req, res) => {

    try {

        const db = await connectDB();


        const {
            userId,
            ebookId
        } = req.body;


        if (!userId || !ebookId) {

            return res.status(400).json({
                message: "User ID and Ebook ID required"
            });

        }


        const result = await db
            .collection("bookmarks")
            .deleteOne({
                userId,
                ebookId,
            });



        if (result.deletedCount === 0) {

            return res.status(404).json({
                message: "Bookmark not found"
            });

        }



        res.json({
            message: "Bookmark removed successfully"
        });



    } catch (error) {

        console.error("Delete bookmark error:", error);


        res.status(500).json({
            message: "Server error"
        });

    }

});


router.get("/check", async (req, res) => {

    try {

        const { userId, ebookId } = req.query;


        if (!userId || !ebookId) {
            return res.status(400).json({
                success: false,
                message: "userId and ebookId required",
            });
        }


        const db = await connectDB();


        const bookmark = await db
            .collection("bookmarks")
            .findOne({
                userId,
                ebookId,
            });


        res.status(200).json({
            success: true,
            bookmarked: Boolean(bookmark),
        });


    } catch (error) {

        console.error("Check bookmark error:", error);


        res.status(500).json({
            success: false,
            message: "Failed to check bookmark",
        });

    }

});







export default router;
