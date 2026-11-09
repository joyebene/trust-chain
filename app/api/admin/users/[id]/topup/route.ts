import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import User from "@/models/User";
import Transaction from "@/models/Transaction";

type Context = {
    params: Promise<{ id: string }>;
};

const schema = z.object({
    amountUSD: z.number().positive().finite(),
    description: z.string().trim().max(250).optional(),
});

export async function POST(
    request: Request,
    { params }: Context
) {
    const session = await mongoose.startSession();

    try {
        const admin = await requireSession("admin");
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid user ID." },
                { status: 400 }
            );
        }

        const body = schema.safeParse(await request.json());

        if (!body.success) {
            return NextResponse.json(
                { error: "Enter a valid top-up amount." },
                { status: 400 }
            );
        }

        const { amountUSD, description } = body.data;

        if (amountUSD > 1000000) {
            return NextResponse.json(
                { error: "Top-up amount exceeds the permitted limit." },
                { status: 400 }
            );
        }

        let updatedUser: any;

        await session.withTransaction(async () => {
            const user = await User.findOne({
                _id: id,
                role: "user",
                isActive: true,
                isDeleted: { $ne: true },
            }).session(session);

            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            const balanceBefore = user.balanceUSD || 0;
            const balanceAfter = balanceBefore + amountUSD;

            user.balanceUSD = balanceAfter;

            await user.save({ session });

            await Transaction.create(
                [
                    {
                        userId: user._id,
                        type: "admin_topup",
                        amountUSD,
                        balanceBeforeUSD: balanceBefore,
                        balanceAfterUSD: balanceAfter,
                        description:
                            description ||
                            "Administrator wallet top-up",
                        performedBy: admin.id,
                        status: "completed",
                    },
                ],
                { session }
            );

            updatedUser = {
                _id: user._id,
                name: user.name,
                email: user.email,
                balanceUSD: balanceAfter,
            };
        });

        return NextResponse.json({
            message: "Wallet topped up successfully.",
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return NextResponse.json(
                { error: "User not found or account is inactive." },
                { status: 404 }
            );
        }

        console.error("Admin wallet top-up error:", error);

        return NextResponse.json(
            { error: "Unable to complete wallet top-up." },
            { status: 500 }
        );
    } finally {
        await session.endSession();
    }
}