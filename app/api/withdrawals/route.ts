import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";

import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import Notification from "@/models/Notification";
import { sendMail } from "@/lib/email";

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

function escapeHtml(value: unknown) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]!);
}


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
        // ENFORCE 14-DAY WITHDRAWAL INTERVAL
        // ==========================================

        const WITHDRAWAL_INTERVAL =
            14 * 24 * 60 * 60 * 1000;

        // Find the most recent withdrawal request,
        // regardless of its status.
        const lastWithdrawal = await Withdrawal.findOne({
            userId: session.id,
        })
            .sort({ createdAt: -1 })
            .select("createdAt");

        if (lastWithdrawal) {
            const nextAvailableDate =
                new Date(
                    lastWithdrawal.createdAt.getTime() +
                    WITHDRAWAL_INTERVAL
                );

            const remainingTime =
                nextAvailableDate.getTime() - Date.now();

            if (remainingTime > 0) {
                return NextResponse.json(
                    {
                        error:
                            "You can only make a withdrawal request once every 14 days.",
                        nextAvailableAt: nextAvailableDate,
                        remainingMilliseconds: remainingTime,
                    },
                    {
                        status: 429,
                    }
                );
            }
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
            }).select("_id name email");

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
        // EMAIL NOTIFICATION DETAILS
        // ==========================================

        const safeName = escapeHtml(user.name);
        const safeEmail = escapeHtml(user.email);
        const safeAmountUSD = escapeHtml(amountUSD.toFixed(2));
        const safePayoutAmount = escapeHtml(data.payoutAmount);
        const safeCurrency = escapeHtml(data.currency);
        const safeNetwork = escapeHtml(data.network);
        const safeWalletAddress = escapeHtml(data.walletAddress);
        const safeNote = escapeHtml(data.note || "No additional note");

        // ==========================================
        // EMAIL USER: WITHDRAWAL SUBMITTED
        // ==========================================

        try {
            await sendMail(
                user.email,
                "Withdrawal Request Submitted",
                `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.6;">
            <h2 style="color:#15803d;">Withdrawal Request Received</h2>

            <p>Hello ${safeName},</p>

            <p>Your withdrawal request has been successfully submitted and is now awaiting review by our administration team.</p>

            <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;">
                <h3 style="color:#166534;margin-top:0;">Withdrawal Details</h3>

                <p><strong>Amount:</strong> $${safeAmountUSD} USD</p>
                <p><strong>Payout Amount:</strong> ${safePayoutAmount} ${safeCurrency}</p>
                <p><strong>Network:</strong> ${safeNetwork}</p>
                <p><strong>Wallet Address:</strong> ${safeWalletAddress}</p>
                <p><strong>Status:</strong> Pending Approval</p>
            </div>

            <p>Your withdrawal amount has already been deducted from your available account balance while the request is being reviewed.</p>

            <p>We will notify you when there is an update on your withdrawal.</p>

            <p>Thank you for using our platform.</p>

            <p>Regards,<br><strong>Customer Support Team</strong></p>
        </div>
        `
            );
        } catch (error) {
            console.error("User withdrawal email failed:", error);
        }

        // ==========================================
        // EMAIL ADMINS: NEW WITHDRAWAL REQUEST
        // ==========================================

        for (const admin of admins) {
            if (!admin.email) continue;

            try {
                await sendMail(
                    admin.email,
                    "New Withdrawal Request - Admin Review Required",
                    `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.6;">
                <h2 style="color:#15803d;">New Withdrawal Request</h2>

                <p>A user has submitted a new withdrawal request. Please review it in your administration dashboard.</p>

                <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
                    <h3 style="margin-top:0;">User Information</h3>

                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(user.phone || "Not provided")}</p>

                    <h3>Withdrawal Information</h3>

                    <p><strong>Amount in USD:</strong> $${safeAmountUSD}</p>
                    <p><strong>Payout Amount:</strong> ${safePayoutAmount} ${safeCurrency}</p>
                    <p><strong>Network:</strong> ${safeNetwork}</p>
                    <p><strong>Wallet Address:</strong> ${safeWalletAddress}</p>
                    <p><strong>User Note:</strong> ${safeNote}</p>
                    <p><strong>Status:</strong> Pending</p>
                </div>

                <p>Please log in to your administration dashboard to review and process this withdrawal.</p>
            </div>
            `
                );
            } catch (error) {
                console.error(
                    `Withdrawal notification failed for admin ${admin.email}:`,
                    error
                );
            }
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