import express from "express";
import { connectDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();



router.get("/", async (req, res) => {
    try {
        const db = await connectDB();
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    {
                        title: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    {
                        "writer.name": {
                            $regex: search,
                            $options: "i",
                        },
                    },
                ],
            };
        }

        const ebooks = await db
            .collection("ebooks")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(ebooks);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load ebooks.",
        });
    }
});


router.get("/admin", async (req, res) => {
    try {
        const db = await connectDB();

        const ebooks = await db
            .collection("ebooks")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(ebooks);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load ebooks.",
        });
    }
});




router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ebook ID.",
            });
        }

        const db = await connectDB();

        const ebook = await db.collection("ebooks").findOne({
            _id: new ObjectId(id),
        });

        if (!ebook) {
            return res.status(404).json({
                success: false,
                message: "Ebook not found.",
            });
        }

        res.json(ebook);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load ebook.",
        });
    }
});



router.post("/", async (req, res) => {
    try {
        const db = await connectDB();

        const ebook = req.body;

        if (
            !ebook.title ||
            !ebook.coverImage ||
            !ebook.description ||
            !ebook.price ||
            !ebook.genre ||
            !ebook.fileUrl
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        const {
            title,
            slug,
            coverImage,
            description,
            price,
            genre,
            language,
            pages,
            fileUrl,
            writer,
        } = req.body;

        const newEbook = {
            title: title.trim(),
            slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),

            coverImage,
            description,

            price: Number(price),
            genre,
            language,
            pages: Number(pages),

            status: "Unpublished",
            writer: {
                id: writer.id,
                name: writer.name,
                email: writer.email,
                photo: writer.photo,
            },

            fileUrl,

            totalSales: 0,
            totalRevenue: 0,
            rating: 0,
            reviews: 0,
            featured: false,

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("ebooks").insertOne(newEbook);

        res.status(201).json({
            success: true,
            message: "Ebook published successfully.",
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to publish ebook.",
        });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ebook ID.",
            });
        }

        const db = await connectDB();

        const result = await db.collection("ebooks").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Ebook not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Ebook deleted successfully.",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete ebook.",
        });
    }
});


router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ebook ID.",
            });
        }

        if (
            status !== "Published" &&
            status !== "Unpublished"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid status.",
            });
        }

        const db = await connectDB();

        const result = await db.collection("ebooks").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Ebook not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: `Ebook ${status.toLowerCase()} successfully.`,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update ebook status.",
        });
    }
});


router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ebook ID.",
            });
        }

        const db = await connectDB();

        const updatedData = {
            ...req.body,
            price: Number(req.body.price),
            pages: Number(req.body.pages),
            updatedAt: new Date(),
        };

        delete updatedData._id;

        const result = await db.collection("ebooks").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: updatedData,
            }
        );

        if (!result.matchedCount) {
            return res.status(404).json({
                success: false,
                message: "Ebook not found.",
            });
        }

        res.json({
            success: true,
            message: "Ebook updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update ebook.",
        });
    }
});





export default router;
