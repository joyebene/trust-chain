import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";
import { sendMail } from "@/lib/email";

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

export async function POST(req: Request) {
    try {
        const data = schema.parse(await req.json());

        await connectDB();

        if (await User.findOne({ email: data.email })) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const u = await User.create({
            ...data,
            passwordHash,
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
        });

        await createSession({
            id: u._id.toString(),
            role: "user",
            email: u.email,
            name: u.name,
        });

        // Safely prepare user details for email
        const name = escapeHtml(u.name);
        const email = escapeHtml(u.email);
        const phone = escapeHtml(u.phone || "Not provided");
        const registrationDate = new Date().toLocaleString("en-NG", {
            dateStyle: "long",
            timeStyle: "short",
        });

        // Send welcome email to the new user
        try {
            await sendMail(
                u.email,
                "Welcome to Our Investment Platform!",
                `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.6;">
                    <h2 style="color:#15803d;">Welcome, ${name}!</h2>

                    <p>Thank you for creating an account with us. We're delighted to welcome you to our investment community.</p>

                    <p>Your account has been successfully created.</p>

                    <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;">
                        <h3 style="color:#166534;margin-top:0;">Your Account Details</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Account Status:</strong> Active</p>
                    </div>

                    <p>You can now log in to your account and explore our investment opportunities.</p>

                    <p>Thank you for choosing us.</p>

                    <p>Regards,<br><strong>Customer Support Team</strong></p>
                </div>
                `
            );
        } catch (error) {
            console.error("Welcome email failed:", error);
        }

        // Notify admin about the new registration
        if (process.env.ADMIN_EMAIL) {
            try {
                await sendMail(
                    process.env.ADMIN_EMAIL,
                    "New User Registration",
                    `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#333;line-height:1.6;">
                        <h2 style="color:#15803d;">New User Registered</h2>

                        <p>A new user has successfully registered on your platform.</p>

                        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0;">
                            <h3 style="margin-top:0;">Registration Details</h3>
                            <p><strong>Full Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Registration Date:</strong> ${escapeHtml(registrationDate)}</p>
                            <p><strong>Account Status:</strong> Active</p>
                        </div>

                        <p>Please log in to your administration dashboard to view this user's account.</p>
                    </div>
                    `
                );
            } catch (error) {
                console.error("Admin registration notification failed:", error);
            }
        } else {
            console.warn("ADMIN_EMAIL is not configured. Admin notification skipped.");
        }

        return NextResponse.json({
            user: {
                id: u._id,
                role: "user",
                name: u.name,
            },
        });

    } catch (e) {
        console.error("Registration error:", e);

        return NextResponse.json(
            {
                error:
                    e instanceof z.ZodError
                        ? "Please provide valid account details."
                        : "Unable to create account.",
            },
            { status: 400 }
        );
    }
}