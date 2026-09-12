import { NextResponse } from "next/server"; 
import { connectDB } from "@/lib/db"; 
import PaymentMethod from "@/models/PaymentMethod"; 
import { getSession } from "@/lib/auth";
export async function GET() { 
    const s = await getSession(); 
    if (!s) return NextResponse.json({ 
        error: "Unauthorized" 
    }, {
        status: 401 
    }); await connectDB(); 
    return NextResponse.json({ methods: await PaymentMethod.find({ isActive: true }).sort({ currency: 1, name: 1 }) }); 
    }
