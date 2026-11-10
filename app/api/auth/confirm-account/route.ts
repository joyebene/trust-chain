
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        // 1. Read request body
        const body = await request.json();

        const token =
            typeof body.token === "string" ? body.token.trim() : "";

        const acceptedPolicies = body.acceptedPolicies === true;

        // 2. Validate confirmation token
        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Confirmation token is missing.",
                },
                { status: 400 }
            );
        }

        // 3. Ensure policies have been accepted
        if (!acceptedPolicies) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You must accept all policies before activating your account.",
                },
                { status: 400 }
            );
        }

        // 4. Connect to MongoDB
        await connectDB();

        // 5. Hash the token to match the hash stored during registration
        const hashedToken = createHash("sha256")
            .update(token)
            .digest("hex");

        const now = new Date();

        // 6. Find and activate the pending account
        // findOneAndUpdate makes the confirmation operation atomic.
        const user = await User.findOneAndUpdate(
            {
                emailVerificationToken: hashedToken,
                emailVerificationExpires: { $gt: now },
                emailVerified: { $ne: true },
                accountStatus: "PENDING",
            },
            {
                $set: {
                    emailVerified: true,
                    policiesAccepted: true,
                    policiesAcceptedAt: now,
                    isActive: true,
                    accountStatus: "ACTIVE",
                },
                $unset: {
                    emailVerificationToken: "",
                    emailVerificationExpires: "",
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        // 7. Handle invalid, expired or previously used tokens
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "This confirmation link is invalid, expired, or has already been used. Please request a new confirmation email.",
                },
                { status: 400 }
            );
        }

        // 8. Return successful confirmation
        return NextResponse.json(
            {
                success: true,
                message: "Your account has been successfully confirmed and activated.",
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("CONFIRM ACCOUNT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: "An unexpected error occurred while confirming your account. Please try again.",
            },
            { status: 500 }
        );
    }
}
