import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    await requireSession("admin");
    await connectDB();

    const users = await User.find({ role: "user" })
      .select(
        "_id firstName lastName email phone role isActive createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession("admin");
    await connectDB();

    const body = await request.json();

    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        role: "user",
      },
      {
        $set: {
          isActive,
        },
      },
      {
        new: true,
      }
    )
      .select(
        "_id firstName lastName email phone role isActive createdAt"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}