import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";

import Payment from "@/models/Payment";
import PaymentMethod from "@/models/PaymentMethod";
import Notification from "@/models/Notification";
import User from "@/models/User";

import { getSession } from "@/lib/auth";
import { sendMail } from "@/lib/email";

/*
==========================================
VALIDATION SCHEMA
==========================================
*/

const schema = z.object({
    paymentMethodId: z
        .string()
        .min(1, "Payment method is required."),

    amount: z
        .number()
        .positive("Amount must be greater than zero."),

    transactionHash: z
        .string()
        .min(
            10,
            "A valid transaction hash is required."
        )
        .trim(),

    note: z
        .string()
        .max(
            500,
            "Note cannot exceed 500 characters."
        )
        .optional()
        .default(""),
});

/*
==========================================
GET PAYMENTS
==========================================
*/

export async function GET() {
    try {
        const session =
            await getSession();

        if (!session) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        await connectDB();

        /*
        Admins can see all payments.

        Normal users can only see
        their own payments.
        */

        const query =
            session.role === "admin"
                ? {}
                : {
                      userId: session.id,
                  };

        const payments =
            await Payment.find(query)
                .populate(
                    "paymentMethodId"
                )
                .populate(
                    "userId",
                    "name email phone"
                )
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
                error:
                    "Failed to load payments.",
            },
            {
                status: 500,
            }
        );
    }
}

/*
==========================================
SUBMIT PAYMENT
==========================================
*/

export async function POST(
    req: Request
) {
    try {
        /*
        ==========================================
        CHECK USER SESSION
        ==========================================
        */

        const session =
            await getSession();

        if (
            !session ||
            session.role !== "user"
        ) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        /*
        ==========================================
        VALIDATE REQUEST
        ==========================================
        */

        const body =
            await req.json();

        const data =
            schema.parse(body);

        await connectDB();

        /*
        ==========================================
        FIND ACTIVE PAYMENT METHOD
        ==========================================
        */

        const method =
            await PaymentMethod.findOne({
                _id:
                    data.paymentMethodId,

                isActive: true,
            });

        if (!method) {
            return NextResponse.json(
                {
                    error:
                        "Payment wallet is unavailable.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
        ==========================================
        VALIDATE WALLET INFORMATION
        ==========================================
        */

        if (
            !method.walletAddress ||
            !method.currency ||
            !method.network
        ) {
            return NextResponse.json(
                {
                    error:
                        "This payment wallet is not properly configured.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        CREATE PAYMENT
        ==========================================
        */

        const payment =
            await Payment.create({
                userId:
                    session.id,

                paymentMethodId:
                    method._id,

                amount:
                    data.amount,

                /*
                Currency comes directly
                from the selected wallet.
                */
                currency:
                    method.currency,

                transactionHash:
                    data.transactionHash,

                note:
                    data.note || "",

                status:
                    "pending",
            });

        /*
        ==========================================
        NOTIFY USER
        ==========================================
        */

        await Notification.create({
            userId:
                session.id,

            title:
                "Payment submitted",

            message:
                `Your ${payment.currency} payment ` +
                `has been submitted and is now ` +
                `pending review.`,

            type:
                "payment",
        });

        /*
        ==========================================
        FIND ACTIVE ADMINS
        ==========================================
        */

        const admins =
            await User.find({
                role: "admin",
                isActive: true,
            }).select("_id");

        /*
        ==========================================
        NOTIFY ADMINS
        ==========================================
        */

        if (
            admins.length
        ) {
            await Notification.insertMany(
                admins.map(
                    (admin) => ({
                        userId:
                            admin._id,

                        title:
                            "New payment submitted",

                        message:
                            `${session.name} submitted a ` +
                            `${payment.amount} ` +
                            `${payment.currency} payment ` +
                            `for review.`,

                        type:
                            "payment",
                    })
                )
            );
        }

        /*
        ==========================================
        EMAIL ADMIN
        ==========================================
        */

        try {
            const adminEmail =
                process.env.ADMIN_EMAIL ||
                process.env.SMTP_USER ||
                "";

            if (adminEmail) {
                await sendMail(
                    adminEmail,

                    "New Trust Chain Payment",

                    `
                    <p>
                        A new crypto payment was
                        submitted by
                        <b>${session.name}</b>.
                    </p>

                    <p>
                        Email:
                        ${session.email}
                    </p>

                    <p>
                        Amount:
                        <b>${payment.amount} ${payment.currency}</b>
                    </p>

                    <p>
                        Network:
                        <b>${method.network}</b>
                    </p>

                    <p>
                        Transaction Hash:
                        <b>${payment.transactionHash}</b>
                    </p>
                    `
                );
            }
        } catch (emailError) {
            console.error(
                "Admin payment email error:",
                emailError
            );

            /*
            Do not fail the payment
            submission if email fails.
            */
        }

        /*
        ==========================================
        SUCCESS RESPONSE
        ==========================================
        */

        return NextResponse.json(
            {
                message:
                    "Payment submitted successfully.",

                payment,
            },
            {
                status: 201,
            }
        );
    } catch (error) {

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error:
                        error.issues[0]?.message ||
                        "Invalid payment submission.",
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: "Invalid payment submission.",
            },
            { status: 500 }
        );
    }
}