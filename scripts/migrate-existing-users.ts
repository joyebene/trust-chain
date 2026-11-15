
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import User from "../models/User";

async function migrateExistingUsers() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        const result = await User.updateMany(
            {
                $or: [
                    { emailVerified: { $ne: true } },
                    { policiesAccepted: { $ne: true } },
                ],
            },
            {
                $set: {
                    emailVerified: true,
                    policiesAccepted: true,
                },
            }
        );

        console.log("Migration completed successfully!");
        console.log(`Matched users: ${result.matchedCount}`);
        console.log(`Updated users: ${result.modifiedCount}`);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migrateExistingUsers();
