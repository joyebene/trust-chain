
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const data = schema.parse(await req.json());

        await connectDB();

        const email = data.email.trim().toLowerCase();

        // Find user and retrieve password hash
        const u = await User.findOne({ email }).select("+passwordHash");

        // Check credentials first
        if (!u || !(await bcrypt.compare(data.password, u.passwordHash))) {
            return NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // Emails exempted from email verification
        const verificationExemptEmails = [
            "joyebene153@gmail.com",
            "admin@trustchain.com",
        ];

        // Check email verification
        const isVerificationExempt = verificationExemptEmails.includes(email);

        if (!u.emailVerified && !isVerificationExempt) {
            return NextResponse.json(
                {
                    error: "Please verify your email address before signing in.",
                    code: "EMAIL_NOT_VERIFIED",
                },
                { status: 403 }
            );
        }

        // Check policy acceptance
        if (!u.policiesAccepted && !isVerificationExempt) {
            return NextResponse.json(
                {
                    error: "You must review and accept our policies before signing in.",
                    code: "POLICIES_NOT_ACCEPTED",
                },
                { status: 403 }
            );
        }

        // Check account activation and status
        if (!u.isActive || u.accountStatus !== "ACTIVE" && !isVerificationExempt) {
            return NextResponse.json(
                {
                    error: "Your account is not currently active. Please contact support.",
                    code: "ACCOUNT_NOT_ACTIVE",
                },
                { status: 403 }
            );
        }

        // Create session only after all checks pass
        await createSession({
            id: u._id.toString(),
            role: u.role,
            email: u.email,
            name: u.name,
        });

        return NextResponse.json({
            message: "Login successful.",
            user: {
                id: u._id.toString(),
                role: u.role,
                name: u.name,
                email: u.email,
            },
        });

    } catch (e) {
        console.error("Login error:", e);

        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please enter a valid email and password." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Unable to sign in. Please try again." },
            { status: 500 }
        );
    }
}
