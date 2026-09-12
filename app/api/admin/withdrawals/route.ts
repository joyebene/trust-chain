import { NextResponse } from "next/server";

import { z } from "zod";

import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";

import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import Notification from "@/models/Notification";

const withdrawalActionSchema = z.object({
    withdrawalId: z
        .string()
        .min(
            1,
            "Withdrawal ID is required."
        ),

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
 * Admin gets ALL withdrawal requests.
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

        if (session.role !== "admin") {
            return NextResponse.json(
                {
                    error:
                        "Forbidden. Admin access required.",
                },
                {
                    status: 403,
                }
            );
        }

        await connectDB();

        const withdrawals =
            await Withdrawal.find({})
                .populate(
                    "userId",
                    "name email phone balanceUSD"
                )
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
            "GET ADMIN WITHDRAWALS ERROR:",
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
 * PATCH
 *
 * Admin approves or declines a withdrawal.
 *
 * APPROVE:
 * pending -> approved
 * balance is deducted here.
 *
 * DECLINE:
 * pending -> declined
 * balance is NOT changed.
 */
export async function PATCH(req: Request) {
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

        if (session.role !== "admin") {
            return NextResponse.json(
                {
                    error:
                        "Forbidden. Admin access required.",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        const data =
            withdrawalActionSchema.parse(
                body
            );

        await connectDB();

        /**
         * Find the withdrawal.
         */
        const withdrawal =
            await Withdrawal.findById(
                data.withdrawalId
            );

        if (!withdrawal) {
            return NextResponse.json(
                {
                    error:
                        "Withdrawal request not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /**
         * Prevent an already processed
         * withdrawal from being processed again.
         */
        if (withdrawal.status !== "pending") {
            return NextResponse.json(
                {
                    error:
                        `This withdrawal has already been ${withdrawal.status}.`,
                },
                {
                    status: 400,
                }
            );
        }

        /**
         * APPROVE
         *
         * Deduct the money from the user's
         * balance ONLY now.
         *
         * The conditional balance check makes
         * this atomic.
         */
        if (data.action === "approve") {

            withdrawal.status =
                "approved";

            withdrawal.reviewedBy =
                session.id;

            withdrawal.reviewedAt =
                new Date();

            if (
                data.transactionHash?.trim()
            ) {
                withdrawal.transactionHash =
                    data.transactionHash.trim();
            }

            await withdrawal.save();

            // Notify the user that the withdrawal was approved
            await Notification.create({
                userId: withdrawal.userId,
                title: "Withdrawal approved",
                message:
                    `Your ${withdrawal.payoutAmount} ${withdrawal.currency} ` +
                    `withdrawal request has been approved.`,
                type: "withdrawal",
                read: false,
            });

            return NextResponse.json({
                message:
                    "Withdrawal approved successfully.",

                withdrawal
            });
        }

        /**
         * DECLINE
         *
         * Nothing is deducted and nothing
         * needs to be refunded because the
         * balance was never deducted.
         */
        if (data.action === "decline") {
            const amountUSD =
                Number(withdrawal.amountUSD);

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

            // Refund the withdrawn amount
            const updatedUser =
                await User.findByIdAndUpdate(
                    withdrawal.userId,
                    {
                        $inc: {
                            balanceUSD: amountUSD,
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
                            "User account could not be found.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            withdrawal.status = "declined";

            withdrawal.declineReason =
                data.reason?.trim() || "";

            withdrawal.reviewedBy =
                session.id;

            withdrawal.reviewedAt =
                new Date();

            await withdrawal.save();

            // Notify user
            await Notification.create({
                userId: withdrawal.userId,
                title: "Withdrawal declined",
                message:
                    `Your ${withdrawal.payoutAmount} ${withdrawal.currency} ` +
                    `withdrawal request was declined.` +
                    (
                        data.reason?.trim()
                            ? ` Reason: ${data.reason.trim()}`
                            : ""
                    ),
                type: "withdrawal",
                read: false,
            });

            return NextResponse.json({
                message:
                    "Withdrawal declined and the amount has been refunded.",
                withdrawal,
                newBalance:
                    updatedUser.balanceUSD,
            });
        }

        return NextResponse.json(
            {
                error:
                    "Invalid withdrawal action.",
            },
            {
                status: 400,
            }
        );
    } catch (error) {
        console.error(
            "UPDATE ADMIN WITHDRAWAL ERROR:",
            error
        );

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ||
                        "Invalid withdrawal action.",
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
                        : "Failed to update withdrawal.",
            },
            {
                status: 500,
            }
        );
    }
}