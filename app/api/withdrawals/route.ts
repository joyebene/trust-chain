import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";

import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import Notification from "@/models/Notification";

const withdrawalSchema = z.object({
    amountUSD: z
        .number()
        .positive("Withdrawal amount must be greater than 0."),

    payoutAmount: z
        .number()
        .positive("Payout amount must be greater than 0."),

    currency: z.enum([
        "BTC",
        "USDT",
        "USDC",
        "ETH",
    ]),

    network: z
        .string()
        .min(1, "Network is required.")
        .max(100),

    walletAddress: z
        .string()
        .min(10, "Wallet address is invalid.")
        .max(300),

    note: z
        .string()
        .max(500)
        .optional(),
});

const withdrawalActionSchema = z.object({
    withdrawalId: z
        .string()
        .min(1, "Withdrawal ID is required."),

    action: z.enum([
        "approve",
        "decline",
    ]),

    reason: z
        .string()
        .max(500)
        .optional(),

    transactionHash: z
        .string()
        .max(300)
        .optional(),
});

/**
 * GET
 *
 * Get withdrawals belonging to the currently
 * authenticated user.
 */
export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                {
                    error: "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        await connectDB();

        const withdrawals =
            await Withdrawal.find({
                userId: session.id,
            })
                .populate(
                    "reviewedBy",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();

        return NextResponse.json({
            withdrawals,
        });
    } catch (error) {
        console.error(
            "GET WITHDRAWALS ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to load withdrawals.",
            },
            {
                status: 500,
            }
        );
    }
}

/**
 * POST
 *
 * User creates a withdrawal request.
 *
 * IMPORTANT:
 * The money is deducted immediately.
 *
 * pending:
 *     money already deducted
 *
 * approved:
 *     nothing happens to balance
 *
 * declined:
 *     money is refunded
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                {
                    error: "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        const body = await req.json();

        const data =
            withdrawalSchema.parse(body);

        await connectDB();

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findById(session.id);

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found.",
                },
                {
                    status: 404,
                }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                {
                    error:
                        "Your account is currently inactive.",
                },
                {
                    status: 403,
                }
            );
        }

        // ==========================================
        // CHECK EXISTING PENDING WITHDRAWAL
        // ==========================================

        const pendingWithdrawal =
            await Withdrawal.findOne({
                userId: session.id,
                status: "pending",
            });

        if (pendingWithdrawal) {
            return NextResponse.json(
                {
                    error:
                        "You already have a pending withdrawal request.",
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // CHECK BALANCE
        // ==========================================

        const amountUSD =
            Number(data.amountUSD);

        if (amountUSD <= 0) {
            return NextResponse.json(
                {
                    error:
                        "Invalid withdrawal amount.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            amountUSD >
            Number(user.balanceUSD || 0)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Withdrawal amount exceeds your available balance.",
                    availableBalance:
                        Number(user.balanceUSD || 0),
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // DEDUCT BALANCE IMMEDIATELY
        // ==========================================
        //
        // The money is removed from the user's
        // spendable balance when the withdrawal
        // is submitted.
        //
        // pending  -> already deducted
        // approved -> no further deduction
        // declined -> refunded by admin route
        //

        const updatedUser =
            await User.findOneAndUpdate(
                {
                    _id: user._id,
                    balanceUSD: {
                        $gte: amountUSD,
                    },
                },
                {
                    $inc: {
                        balanceUSD:
                            -amountUSD,
                    },
                },
                {
                    new: true,
                }
            );

        if (!updatedUser) {
            return NextResponse.json(
                {
                    error:
                        "Insufficient balance for this withdrawal.",
                },
                {
                    status: 400,
                }
            );
        }

        // ==========================================
        // CREATE WITHDRAWAL
        // ==========================================

        const withdrawal =
            await Withdrawal.create({
                userId: session.id,

                amountUSD:
                    amountUSD,

                payoutAmount:
                    data.payoutAmount,

                currency:
                    data.currency,

                network:
                    data.network,

                walletAddress:
                    data.walletAddress,

                note:
                    data.note || "",

                status: "pending",
            });

        // ==========================================
        // NOTIFY USER
        // ==========================================

        await Notification.create({
            userId: session.id,

            title:
                "Withdrawal submitted",

            message:
                `Your ${data.currency} withdrawal request ` +
                `of ${data.payoutAmount} ${data.currency} ` +
                `has been submitted and is now pending admin approval.`,

            type: "withdrawal",

            read: false,
        });

        // ==========================================
        // FIND ACTIVE ADMINS
        // ==========================================

        const admins =
            await User.find({
                role: "admin",
                isActive: true,
            }).select("_id");

        // ==========================================
        // NOTIFY ADMINS
        // ==========================================

        if (admins.length) {
            await Notification.insertMany(
                admins.map((admin) => ({
                    userId:
                        admin._id,

                    title:
                        "New withdrawal request",

                    message:
                        `${session.name} submitted a ` +
                        `${data.payoutAmount} ${data.currency} ` +
                        `withdrawal request for review.`,

                    type: "withdrawal",

                    read: false,
                }))
            );
        }

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return NextResponse.json(
            {
                message:
                    "Withdrawal request submitted successfully and is pending admin approval.",

                withdrawal,

                // This is the NEW balance
                // after the deduction.
                balanceUSD:
                    updatedUser.balanceUSD,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE WITHDRAWAL ERROR:",
            error
        );

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ||
                        "Invalid withdrawal details.",
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to submit withdrawal request.",
            },
            {
                status: 500,
            }
        );
    }
}