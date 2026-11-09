
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import User from "@/models/User";
import Payment from "@/models/Payment";
import Investment from "@/models/Investment";

type Context = {
    params: Promise<{ id: string }>;
};

// GET USER DETAILS
export async function GET(
    request: Request,
    { params }: Context
) {
    try {
        await requireSession("admin");
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid user ID." },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            _id: id,
            role: "user",
            isDeleted: { $ne: true },
        })
            .select(
                "_id name email phone role isActive balanceUSD investedBalanceUSD totalProfitUSD createdAt"
            )
            .lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        const [payments, investments] = await Promise.all([
            Payment.find({ userId: id })
                .sort({ createdAt: -1 })
                .lean(),

            Investment.find({ userId: id })
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return NextResponse.json({
            user,
            payments,
            investments,
        });

    } catch (error) {
        console.error("Get user details error:", error);

        if (
            error instanceof Error &&
            error.message === "UNAUTHORIZED"
        ) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Unable to load user details." },
            { status: 500 }
        );
    }
}

// SOFT DELETE USER
export async function DELETE(
    request: Request,
    { params }: Context
) {
    try {
        await requireSession("admin");
        await connectDB();

        const { id } = await params;

        if (!/^[a-f\d]{24}$/i.test(id)) {
            return NextResponse.json(
                { error: "Invalid user ID." },
                { status: 400 }
            );
        }

        const user = await User.findOneAndDelete({
            _id: id,
            role: "user",
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User permanently deleted from the database.",
            userId: id,
        });
    } catch (error) {
        console.error("Delete user error:", error);

        if (
            error instanceof Error &&
            error.message === "UNAUTHORIZED"
        ) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Unable to delete user." },
            { status: 500 }
        );
    }
}