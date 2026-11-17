
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { sendMail } from "@/lib/email";

const schema = z.object({
    email: z.string().email(),
});

export async function POST(req: Request) {
    try {
        const data = schema.parse(await req.json());

        await connectDB();

        const email = data.email.trim().toLowerCase();

        const successMessage =
            "If an account exists with this email address, a password reset link has been sent. Please check your inbox and spam folder.";

        const user = await User.findOne({ email });

        // Always return the same response for unknown accounts.
        if (!user) {
            return NextResponse.json({
                success: true,
                message: successMessage,
            });
        }

        // Generate a cryptographically secure token.
        const token = randomBytes(32).toString("hex");

        // Store only the SHA-256 hash.
        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        // Invalidate previous unused reset tokens.
        await PasswordResetToken.deleteMany({
            userId: user._id,
            usedAt: null,
        });

        // Token expires in 30 minutes.
        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await PasswordResetToken.create({
            userId: user._id,
            tokenHash,
            expiresAt,
        });

        const appUrl = (
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.APP_URL ||
            ""
        ).replace(/\/$/, "");

        if (!appUrl) {
            throw new Error("Application URL is not configured.");
        }

        const resetUrl =
            `${appUrl}/reset-password?token=${token}`;


        await sendMail(
            user.email,
            "Reset Your Trust Chain Password",
            `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#24332b;background:#ffffff;">

        <div style="text-align:center;margin-bottom:30px;">
            <h2 style="color:#103d30;">TRUST CHAIN</h2>
        </div>

        <h2 style="color:#103d30;">Reset Your Password</h2>

        <p>Hello ${escapeHtml(user.name)},</p>

        <p>
            We received a request to reset your Trust Chain account password.
        </p>

        <p>
            Click the button below to create a new password.
        </p>

        <div style="margin:30px 0;text-align:center;">
            <a
                href="${resetUrl}"
                style="
                    background:#dcae45;
                    color:#103d30;
                    padding:14px 28px;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                    display:inline-block;
                "
            >
                Reset My Password
            </a>
        </div>

        <p>
            This password reset link expires in
            <strong>30 minutes</strong> and can only be used once.
        </p>

        <p>
            If the button doesn't work, copy and paste this link into your browser:
        </p>

        <p style="word-break:break-all;color:#103d30;">
            ${resetUrl}
        </p>

        <p>
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

        <p style="font-size:12px;color:#777;text-align:center;">
            Trust Chain Security Team
        </p>

    </div>
    `
        );


        return NextResponse.json({
            success: true,
            message: successMessage,
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Unable to process your request right now. Please try again later.",
            },
            { status: 500 }
        );
    }
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[char];
    });
}
