import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Payment from "@/models/Payment";
import User from "@/models/User";
import Investment from "@/models/Investment";
import Notification from "@/models/Notification";
import { sendMail } from "@/lib/email";

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

async function sendPaymentEmail(
    to: string | undefined,
    subject: string,
    html: string
) {
    if (!to) {
        console.warn("Payment email skipped: recipient email missing.");
        return;
    }

    try {
        await sendMail(to, subject, html);
    } catch (error) {
        // Email failure must not undo an approved or declined payment.
        console.error("Payment email delivery failed:", error);
    }
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

        const paymentsWithEstimate = payments.map((payment) => {
            const paymentData = payment.toObject();

            const rate = getCryptoUsdRate(
                payment.currency
            );

            const estimatedAmountUSD =
                Number(payment.amount) * rate;

            return {
                ...paymentData,
                estimatedAmountUSD:
                    rate > 0
                        ? Math.round(estimatedAmountUSD * 100) / 100
                        : null,
            };
        });

        return NextResponse.json({
            payments: paymentsWithEstimate,
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
            creditedAmountUSD: adminApprovedAmount,
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
                    `${payment.declineReason
                    }`,

                type: "payment",
            });

            // EMAIL THE CLIENT
            await sendPaymentEmail(
                user.email,
                "Payment Declined",
                `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#333;">
        <h2 style="color:#dc2626;">Payment Declined</h2>

        <p>Hello ${user.name || "Valued Client"},</p>

        <p>Unfortunately, your cryptocurrency payment has been declined after review.</p>

        <div style="background:#f9fafb;padding:18px;border-radius:8px;margin:20px 0;">
            <p><strong>Payment Amount:</strong> ${payment.amount} ${payment.currency}</p>
            <p><strong>Transaction Hash:</strong> ${payment.transactionHash || "—"}</p>
            <p><strong>Status:</strong> Declined</p>
        </div>

        <p><strong>Reason for declining:</strong></p>
        <p style="color:#dc2626;">${payment.declineReason}</p>

        <p>If you believe this decision was made in error, please contact our support team.</p>

        <p>Regards,<br><strong>Customer Support Team</strong></p>
    </div>
    `
            );

            // EMAIL THE ADMIN
            await sendPaymentEmail(
                process.env.ADMIN_EMAIL,
                "Payment Declined - Admin Notification",
                `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#333;">
        <h2>Payment Declined</h2>

        <p>An administrator has declined a payment.</p>

        <p><strong>Client:</strong> ${user.name || "Unknown"}</p>
        <p><strong>Email:</strong> ${user.email || "—"}</p>
        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
        <p><strong>Transaction Hash:</strong> ${payment.transactionHash || "—"}</p>
        <p><strong>Reason:</strong> ${payment.declineReason}</p>
    </div>
    `
            );

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

        /* ==========================================
           CALCULATE USD VALUE
        ========================================== */

        // Calculate the default USD amount using
        // the crypto amount and configured FX rate.
        let creditedAmountUSD =
            originalAmount * fxRate;

        // If admin entered a custom USD amount,
        // use that instead of the calculated amount.
        if (adminApprovedAmount !== undefined) {
            const customAmount = Number(adminApprovedAmount);

            if (
                !Number.isFinite(customAmount) ||
                customAmount <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Please enter a valid approved USD amount.",
                    },
                    { status: 400 }
                );
            }

            creditedAmountUSD = customAmount;
        }

        // Round to 2 decimal places.
        creditedAmountUSD =
            Math.round(creditedAmountUSD * 100) / 100;

        // Final validation.
        if (
            !Number.isFinite(creditedAmountUSD) ||
            creditedAmountUSD <= 0
        ) {
            return NextResponse.json(
                {
                    error: "Invalid USD conversion amount.",
                },
                { status: 400 }
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

        // EMAIL THE CLIENT
        await sendPaymentEmail(
            user.email,
            "Payment Approved - Investment Activated",
            `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#333;">
        <h2 style="color:#15803d;">Payment Approved!</h2>

        <p>Hello ${user.name || "Valued Client"},</p>

        <p>Good news! Your cryptocurrency payment has been successfully verified and approved.</p>

        <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;">
            <p><strong>Original Payment:</strong> ${originalAmount} ${currency}</p>
            <p><strong>Approved USD Amount:</strong> $${creditedAmountUSD.toFixed(2)}</p>
            <p><strong>Conversion Rate:</strong> ${fxRate.toLocaleString()} USD per ${currency}</p>
            <p><strong>Transaction Hash:</strong> ${payment.transactionHash || "—"}</p>
            <p><strong>Payment Status:</strong> Approved</p>
            <p><strong>Investment Status:</strong> Active</p>
        </div>

        <p>Your account has been credited with <strong>$${creditedAmountUSD.toFixed(2)} USD</strong>, and an investment has been created successfully.</p>

        <p>You can log in to your account to view your updated balance and investment details.</p>

        <p>Thank you for choosing us.</p>

        <p>Regards,<br><strong>Customer Support Team</strong></p>
    </div>
    `
        );

        // EMAIL THE ADMIN
        await sendPaymentEmail(
            process.env.ADMIN_EMAIL,
            "Payment Approved - Admin Notification",
            `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#333;">
        <h2 style="color:#15803d;">Payment Successfully Approved</h2>

        <p>A client payment has been approved and credited.</p>

        <div style="background:#f9fafb;padding:20px;border-radius:8px;">
            <p><strong>Client:</strong> ${user.name || "Unknown"}</p>
            <p><strong>Client Email:</strong> ${user.email || "—"}</p>
            <p><strong>Original Amount:</strong> ${originalAmount} ${currency}</p>
            <p><strong>Credited USD:</strong> $${creditedAmountUSD.toFixed(2)}</p>
            <p><strong>FX Rate:</strong> ${fxRate.toLocaleString()}</p>
            <p><strong>Transaction Hash:</strong> ${payment.transactionHash || "—"}</p>
            <p><strong>Investment ID:</strong> ${investment._id}</p>
            <p><strong>Payment Status:</strong> Approved</p>
        </div>
    </div>
    `
        );

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