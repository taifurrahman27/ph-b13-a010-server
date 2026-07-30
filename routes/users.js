import express from "express";
import { connectDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();



router.get("/", async (req, res) => {
    try {
        const db = await connectDB();

        const users = await db
            .collection("user")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(users);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load users.",
        });
    }
});



router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const db = await connectDB();

        const result = await db.collection("user").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
});



router.patch("/:id/role", async (req, res) => {
    try {
        const { role } = req.body;

        if (!["reader", "writer", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }

        const db = await connectDB();

        const result = await db.collection("user").updateOne(
            {
                _id: new ObjectId(req.params.id),
            },
            {
                $set: {
                    role,
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "Role updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update role.",
        });
    }
});






export default router;