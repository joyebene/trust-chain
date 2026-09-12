import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import PaymentMethod from "@/models/PaymentMethod";
import { requireSession } from "@/lib/auth";

const schema = z.object({
    name: z
        .string()
        .min(2, "Name is required.")
        .trim(),

    currency: z.enum([
        "BTC",
        "USDT",
        "USDC",
        "ETH",
    ]),

    network: z
        .string()
        .min(2, "Network is required.")
        .trim(),

    walletAddress: z
        .string()
        .min(
            10,
            "Wallet address is required."
        )
        .trim(),

    instructions: z
        .string()
        .optional()
        .default(""),
});

export async function GET() {
    try {
        await requireSession("admin");

        await connectDB();

        const methods =
            await PaymentMethod.find()
                .sort({
                    createdAt: -1,
                })
                .lean();

        return NextResponse.json({
            methods,
        });
    } catch (error) {
        console.error(
            "GET PAYMENT METHODS ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
}

export async function POST(
    req: Request
) {
    try {
        console.log(
            "========== ADD PAYMENT METHOD =========="
        );

        /*
        ==========================================
        AUTH
        ==========================================
        */

        await requireSession("admin");

        console.log(
            "Admin authentication passed."
        );

        /*
        ==========================================
        READ BODY
        ==========================================
        */

        const body =
            await req.json();

        console.log(
            "Request body:",
            body
        );

        /*
        ==========================================
        VALIDATE
        ==========================================
        */

        const data =
            schema.parse(body);

        console.log(
            "Validated data:",
            data
        );

        /*
        ==========================================
        DATABASE
        ==========================================
        */

        await connectDB();

        console.log(
            "Database connected."
        );

        /*
        ==========================================
        CHECK DUPLICATE
        ==========================================
        */

        const existing =
            await PaymentMethod.findOne({
                walletAddress:
                    data.walletAddress,

                network:
                    data.network,
            });

        if (existing) {
            return NextResponse.json(
                {
                    error:
                        "This wallet address already exists for this network.",
                },
                {
                    status: 409,
                }
            );
        }

        /*
        ==========================================
        CREATE WALLET
        ==========================================
        */

        const paymentMethod =
            await PaymentMethod.create({
                name: data.name,

                currency:
                    data.currency,

                network:
                    data.network,

                walletAddress:
                    data.walletAddress,

                instructions:
                    data.instructions || "",

                isActive: true,
            });

        console.log(
            "Payment method created:",
            paymentMethod._id
        );

        /*
        ==========================================
        RESPONSE
        ==========================================
        */

        return NextResponse.json(
            {
                message:
                    "Wallet payment method added successfully.",

                method: paymentMethod,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "========== ADD PAYMENT METHOD ERROR =========="
        );

        console.error(error);

        /*
        ==========================================
        ZOD ERROR
        ==========================================
        */

        if (
            error instanceof z.ZodError
        ) {
            console.error(
                "ZOD ISSUES:",
                error.issues
            );

            return NextResponse.json(
                {
                    error:
                        error.issues[0]
                            ?.message ||
                        "Invalid wallet details.",

                    details:
                        error.issues,
                },
                {
                    status: 400,
                }
            );
        }

        /*
        ==========================================
        NORMAL ERROR
        ==========================================
        */

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to add payment method.",

                details:
                    process.env.NODE_ENV ===
                        "development"
                        ? String(error)
                        : undefined,
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        console.log(
            "========== DELETE PAYMENT METHOD =========="
        );

        await requireSession("admin");

        const { searchParams } =
            new URL(req.url);

        const id =
            searchParams.get("id");

        console.log(
            "Payment method ID:",
            id
        );

        if (!id) {
            return NextResponse.json(
                {
                    error:
                        "Payment method ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        await connectDB();

        const paymentMethod =
            await PaymentMethod.findById(id);

        if (!paymentMethod) {
            return NextResponse.json(
                {
                    error:
                        "Payment method not found.",
                },
                {
                    status: 404,
                }
            );
        }

        await PaymentMethod.findByIdAndDelete(
            id
        );

        console.log(
            "Payment method deleted:",
            id
        );

        return NextResponse.json({
            message:
                "Payment method deleted successfully.",
        });
    } catch (error) {
        console.error(
            "DELETE PAYMENT METHOD ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete payment method.",
            },
            {
                status: 500,
            }
        );
    }
}