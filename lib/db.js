import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion } from "mongodb";

let db;
let client;

export async function connectDB() {
    if (!db) {
        client = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });

        await client.connect();

        db = client.db("fable");

        console.log("✅ MongoDB Connected");
    }

    return db;
}
