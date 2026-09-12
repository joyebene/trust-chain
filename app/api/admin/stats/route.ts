import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";

import { requireSession } from "@/lib/auth";

import User from "@/models/User";

import Payment from "@/models/Payment";

import Investment from "@/models/Investment";

import Withdrawal from "@/models/Withdrawal";

export async function GET() {
    try {
        // ==========================================
        // CHECK ADMIN
        // ==========================================

        await requireSession("admin");

        await connectDB();

        // ==========================================
        // GET DASHBOARD STATISTICS
        // ==========================================

        const [
            users,
            totalPayments,
            pendingPayments,
            approvedPayments,
            investments,
            totalPaidResult,
        ] = await Promise.all([
            /**
             * Total registered normal users
             */
            User.countDocuments({
                role: "user",
            }),

            /**
             * Total approved payments
             *
             * This is the total number of
             * successfully approved deposits.
             */
            Payment.countDocuments({
                status: "approved",
            }),

            /**
             * Payments waiting for admin review
             */
            Payment.countDocuments({
                status: "pending",
            }),

            /**
             * Successfully approved payments
             */
            Payment.countDocuments({
                status: "approved",
            }),

            /**
             * Currently active investments
             */
            Investment.countDocuments({
                status: "active",
            }),

            /**
             * Total amount paid out through
             * approved withdrawals.
             *
             * We use amountUSD because the platform
             * supports BTC, ETH, USDT and USDC.
             *
             * We cannot add raw crypto amounts together
             * because 1 BTC + 1 USDT would not be
             * meaningful.
             */
            Withdrawal.aggregate([
                {
                    $match: {
                        status: "approved",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amountUSD",
                        },
                    },
                },
            ]),
        ]);

        // ==========================================
        // GET TOTAL PAID
        // ==========================================

        const totalPaid =
            Number(
                totalPaidResult[0]?.total || 0
            );

        // ==========================================
        // RESPONSE
        // ==========================================

        return NextResponse.json({
            totalUsers: users,

            totalPayments,

            pendingPayments,

            approvedPayments,

            totalInvestments:
                investments,

            totalPaid,
        });
    } catch (error) {
        console.error(
            "Admin dashboard stats error:",
            error
        );

        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
}