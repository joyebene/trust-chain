import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Payment from "@/models/Payment";
import User from "@/models/User";
import Investment from "@/models/Investment";
import Notification from "@/models/Notification";

function getCryptoUsdRate(currency: string) {
    /*
    ==========================================
    CRYPTO -> USD RATES
    ==========================================

    These are fallback/demo rates.

    For production, replace this with:
    - a trusted live crypto price API, OR
    - an admin-entered rate.

    USDT and USDC are treated as approximately
    1 USD each.
    */

    const rates: Record<string, number> = {
        USDT: Number(process.env.USDT_USD_RATE) || 1,
        USDC: Number(process.env.USDC_USD_RATE) || 1,
        BTC: Number(process.env.BTC_USD_RATE) || 0,
        ETH: Number(process.env.ETH_USD_RATE) || 0,
    };

    return rates[currency] || 0;
}

export async function GET() {
    try {
        /*
        ==========================================
        CHECK ADMIN
        ==========================================
        */

        await requireSession("admin");

        await connectDB();

        /*
        ==========================================
        GET ALL PAYMENTS
        ==========================================
        */

        const payments = await Payment.find()
            .populate(
                "userId",
                "name email phone"
            )
            .populate("paymentMethodId")
            .sort({
                createdAt: -1,
            });

        return NextResponse.json({
            payments,
        });
    } catch (error) {
        console.error(
            "Get payments error:",
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

export async function PATCH(
    request: Request
) {
    try {
        /*
        ==========================================
        CHECK ADMIN
        ==========================================
        */

        const admin =
            await requireSession("admin");

        await connectDB();

        /*
        ==========================================
        GET REQUEST DATA
        ==========================================
        */

        const body =
            await request.json();

        const {
            paymentId,
            action,
            reason,
        } = body;

        /*
        ==========================================
        VALIDATE PAYMENT ID
        ==========================================
        */

        if (!paymentId) {
            return NextResponse.json(
                {
                    error:
                        "Payment ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        VALIDATE ACTION
        ==========================================
        */

        if (
            ![
                "approve",
                "decline",
            ].includes(action)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid payment action.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        FIND PAYMENT
        ==========================================
        */

        const payment =
            await Payment.findById(
                paymentId
            );

        if (!payment) {
            return NextResponse.json(
                {
                    error:
                        "Payment not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
        ==========================================
        PREVENT DOUBLE PROCESSING
        ==========================================
        */

        if (
            payment.status !==
            "pending"
        ) {
            return NextResponse.json(
                {
                    error:
                        `Payment has already been ${payment.status}.`,
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        FIND USER
        ==========================================
        */

        const user =
            await User.findById(
                payment.userId
            );

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Payment user not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
        ==========================================
        DECLINE PAYMENT
        ==========================================
        */

        if (
            action === "decline"
        ) {
            payment.status =
                "declined";

            payment.declineReason =
                typeof reason === "string" &&
                reason.trim()
                    ? reason.trim()
                    : "Payment declined.";

            payment.reviewedBy =
                admin.id;

            payment.reviewedAt =
                new Date();

            await payment.save();

            /*
            ==========================================
            NOTIFY USER
            ==========================================
            */

            await Notification.create({
                userId: user._id,

                title:
                    "Payment declined",

                message:
                    `Your ${payment.currency} payment ` +
                    `has been declined. ` +
                    `${
                        payment.declineReason
                    }`,

                type: "payment",
            });

            return NextResponse.json({
                message:
                    "Payment declined successfully.",

                payment,
            });
        }

        /*
        ==========================================
        APPROVE PAYMENT
        ==========================================
        */

        /*
        The payment amount is stored in the
        original cryptocurrency.

        Example:

        amount = 0.05
        currency = BTC

        We convert that to USD using the
        configured BTC/USD rate.
        */

        const currency =
            payment.currency;

        const originalAmount =
            Number(payment.amount);

        if (
            !originalAmount ||
            originalAmount <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid payment amount.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        GET CRYPTO/USD RATE
        ==========================================
        */

        const fxRate =
            getCryptoUsdRate(
                currency
            );

        if (
            !fxRate ||
            fxRate <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        `A valid ${currency}/USD conversion rate is required before this payment can be approved.`,
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        CALCULATE USD VALUE
        ==========================================
        */

        let creditedAmountUSD =
            originalAmount *
            fxRate;

        /*
        ==========================================
        ROUND USD VALUE
        ==========================================
        */

        creditedAmountUSD =
            Math.round(
                creditedAmountUSD *
                    100
            ) / 100;

        /*
        ==========================================
        VALIDATE USD VALUE
        ==========================================
        */

        if (
            creditedAmountUSD <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid USD conversion amount.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        CREATE INVESTMENT
        ==========================================
        */

        const startedAt =
            new Date();

        /*
        Investment cycle:
        3 - 5 days.

        For now, the investment ends
        at the maximum 5-day period.
        */

        const endsAt =
            new Date(
                startedAt.getTime() +
                    5 *
                        24 *
                        60 *
                        60 *
                        1000
            );

        const investment =
            await Investment.create({
                userId:
                    user._id,

                paymentId:
                    payment._id,

                /*
                Canonical investment
                value.
                */
                amountUSD:
                    creditedAmountUSD,

                /*
                Original crypto
                amount.
                */
                originalAmount:
                    originalAmount,

                /*
                Original crypto
                currency.
                */
                currency:
                    currency,

                targetReturnPercent:
                    300,

                cycleDaysMin:
                    3,

                cycleDaysMax:
                    5,

                status:
                    "active",

                startedAt,

                endsAt,

                profitUSD:
                    0,

                payoutUSD:
                    0,
            });

        /*
        ==========================================
        UPDATE USER BALANCES
        ==========================================
        */

        /*
        Available wallet balance.
        */

        user.balanceUSD =
            (user.balanceUSD || 0) +
            creditedAmountUSD;

        /*
        Total amount currently
        invested.
        */

        user.investedBalanceUSD =
            (user.investedBalanceUSD || 0) +
            creditedAmountUSD;

        /*
        ==========================================
        UPDATE PAYMENT
        ==========================================
        */

        payment.creditedAmountUSD =
            creditedAmountUSD;

        payment.fxRate =
            fxRate;

        payment.status =
            "approved";

        payment.reviewedBy =
            admin.id;

        payment.reviewedAt =
            new Date();

        /*
        ==========================================
        SAVE EVERYTHING
        ==========================================
        */

        await user.save();

        await payment.save();

        /*
        ==========================================
        NOTIFY USER
        ==========================================
        */

        await Notification.create({
            userId: user._id,

            title:
                "Payment approved",

            message:
                `Your payment of ` +
                `${originalAmount} ${currency} ` +
                `has been approved. ` +
                `$${creditedAmountUSD.toFixed(
                    2
                )} USD has been credited ` +
                `to your account and an investment ` +
                `has been created.`,

            type: "payment",
        });

        /*
        ==========================================
        SUCCESS RESPONSE
        ==========================================
        */

        return NextResponse.json({
            message:
                "Payment approved, wallet credited and investment created successfully.",

            payment,

            investment,

            creditedAmountUSD,

            fxRate,
        });
    } catch (error) {
        console.error(
            "Payment review error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to process payment.",
            },
            {
                status: 500,
            }
        );
    }
}