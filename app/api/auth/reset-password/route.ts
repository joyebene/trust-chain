
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const data = schema.parse(await req.json());

        await connectDB();

        // Hash the supplied token before database lookup.
        const tokenHash = createHash("sha256")
            .update(data.token)
            .digest("hex");

        // Find a valid, unused and unexpired token.
        const resetToken = await PasswordResetToken.findOne({
            tokenHash,
            usedAt: null,
            expiresAt: { $gt: new Date() },
        });

        if (!resetToken) {
            return NextResponse.json(
                {
                    error: "This password reset link is invalid or has expired. Please request a new one.",
                    code: "INVALID_OR_EXPIRED_TOKEN",
                },
                { status: 400 }
            );
        }

        // Atomically claim the token to prevent reuse.
        const claimedToken =
            await PasswordResetToken.findOneAndUpdate(
                {
                    _id: resetToken._id,
                    usedAt: null,
                    expiresAt: { $gt: new Date() },
                },
                {
                    $set: { usedAt: new Date() },
                },
                { new: true }
            );

        if (!claimedToken) {
            return NextResponse.json(
                {
                    error: "This password reset link is invalid or has already been used.",
                    code: "INVALID_OR_EXPIRED_TOKEN",
                },
                { status: 400 }
            );
        }

        // Hash the new password.
        const passwordHash = await bcrypt.hash(
            data.password,
            12
        );

        // Update the user's password.
        const user = await User.findByIdAndUpdate(
            claimedToken.userId,
            {
                $set: { passwordHash },
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: "Unable to locate this account." },
                { status: 404 }
            );
        }

        // Invalidate any other outstanding reset links.
        await PasswordResetToken.updateMany(
            {
                userId: user._id,
                _id: { $ne: claimedToken._id },
                usedAt: null,
            },
            {
                $set: { usedAt: new Date() },
            }
        );

        return NextResponse.json({
            success: true,
            message: "Your password has been reset successfully. You can now sign in.",
        });

    } catch (error) {
        console.error("Reset password error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Your password must contain at least 8 characters.",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Unable to reset your password. Please try again.",
            },
            { status: 500 }
        );
    }
}
