import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const s = await getSession();

        if (!s) {
            console.log("NO SESSION");

            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const u = await User.findById(s.id).select("-passwordHash");

        if (!u) {
            return NextResponse.json(
                {
                    error: "User not found",
                    sessionId: s.id,
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: u,
        });
    } catch (error) {
        console.error("GET /api/me ERROR:", error);

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}