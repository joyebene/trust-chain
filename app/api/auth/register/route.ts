
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendMail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    password: z.string().min(8),
});

// Escape user-provided values before inserting them into HTML emails
function escapeHtml(value: unknown) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]!);
}

// Hash verification token before storing it
function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
    let createdUserId: string | null = null;

    try {
        const data = schema.parse(await req.json());

        await connectDB();

        const email = data.email.trim().toLowerCase();

        // Check existing account
        if (await User.findOne({ email })) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        // Generate secure verification token
        const verificationToken = randomBytes(32).toString("hex");
        const hashedToken = hashToken(verificationToken);

        // Token expires after 24 hours
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create pending account
        const u = await User.create({
            name: data.name.trim(),
            email,
            phone: data.phone.trim(),
            passwordHash,

            role: "user",

            balances: {
                NGN: 0,
                USD: 0,
                BTC: 0,
            },

            investedBalances: {
                NGN: 0,
                USD: 0,
                BTC: 0,
            },

            // Account must not be active yet
            isActive: false,
            emailVerified: false,
            policiesAccepted: false,
            policiesAcceptedAt: null,

            accountStatus: "PENDING",

            emailVerificationToken: hashedToken,
            emailVerificationExpires: expires,
        });

        createdUserId = u._id.toString();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
        }

        const confirmationUrl =
            `${baseUrl.replace(/\/$/, "")}/confirm-account?token=${verificationToken}`;

        // Prepare safe email values
        const name = escapeHtml(u.name);
        const safeEmail = escapeHtml(u.email);
        const phone = escapeHtml(u.phone || "Not provided");

        const registrationDate = escapeHtml(
            new Date().toLocaleString("en-NG", {
                dateStyle: "long",
                timeStyle: "short",
            })
        );

        // Send account verification email
        const verificationEmailSent = await sendMail(
            u.email,
            "Confirm Your Trust Chain Account",
            `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.7;">
                <div style="text-align:center;margin-bottom:25px;">
                    <h2 style="color:#166534;">Welcome to Trust Chain, ${name}!</h2>
                </div>

                <p>Thank you for creating an account with Trust Chain.</p>

                <p>Your registration has been received. Before you can access your account, you need to verify your email address and review our account policies.</p>

                <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:25px 0;">
                    <h3 style="color:#166534;margin-top:0;">Your Registration Details</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Account Status:</strong> Pending Verification</p>
                </div>

                <div style="text-align:center;margin:30px 0;">
                    <a href="${confirmationUrl}"
                       style="background:#d4af37;color:#111;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">
                        Verify My Email
                    </a>
                </div>

                <p>After clicking the button, you will be asked to review:</p>

                <ul>
                    <li>Privacy Policy</li>
                    <li>Refund Policy</li>
                    <li>Withdrawal Policy</li>
                    <li>Terms and Conditions</li>
                </ul>

                <p>You must accept these policies before your account can be activated.</p>

                <p>This verification link expires in <strong>24 hours</strong>.</p>

                <p>If you did not create this account, you can ignore this email.</p>

                <p>Regards,<br><strong>Trust Chain Support Team</strong></p>
            </div>
            `
        );

        if (!verificationEmailSent) {
            throw new Error("Unable to send verification email.");
        }

        // Notify admin about the pending registration
        if (process.env.ADMIN_EMAIL) {
            try {
                await sendMail(
                    process.env.ADMIN_EMAIL,
                    "New Trust Chain Registration",
                    `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.7;">
                        <h2 style="color:#166534;">New User Registration</h2>

                        <p>A new user has registered on Trust Chain.</p>

                        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
                            <h3 style="margin-top:0;">Registration Details</h3>
                            <p><strong>Full Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${safeEmail}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Registration Date:</strong> ${registrationDate}</p>
                            <p><strong>Account Status:</strong> Pending Verification</p>
                        </div>

                        <p>The user must verify their email and accept the required policies before their account becomes active.</p>
                    </div>
                    `
                );
            } catch (error) {
                console.error("Admin registration notification failed:", error);
            }
        } else {
            console.warn("ADMIN_EMAIL is not configured. Admin notification skipped.");
        }

        return NextResponse.json(
            {
                message: "Registration successful. Please check your email to verify your account.",
                email: u.email,
            },
            { status: 201 }
        );

    } catch (e) {
        console.error("Registration error:", e);

        // Delete the pending account if the verification email could not be sent
        if (createdUserId) {
            try {
                await User.findByIdAndDelete(createdUserId);
            } catch (deleteError) {
                console.error("Failed to clean up pending registration:", deleteError);
            }
        }

        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please provide valid account details." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Unable to create account. Please try again." },
            { status: 500 }
        );
    }
}
