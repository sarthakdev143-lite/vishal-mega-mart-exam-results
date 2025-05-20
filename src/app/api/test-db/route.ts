import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        await client.db("vishal-exam").command({ ping: 1 });
        
        return NextResponse.json(
            { message: "Database connection successful" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Database connection test failed:", error);
        return NextResponse.json(
            {
                message: "Database connection failed",
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}