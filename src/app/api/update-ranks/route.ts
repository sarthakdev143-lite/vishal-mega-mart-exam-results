import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const token = req.headers.get("authorization");
    const isVercelCron = req.headers.get("x-vercel-signature") !== null;

    if (token !== `Bearer ${process.env.ADMIN_SECRET}` && !isVercelCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("vishal-exam");
        const collection = db.collection("results");

        const results = await collection
            .find({})
            .sort({ totalMarks: -1 })
            .toArray();

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            await collection.updateOne({ _id: result._id }, { $set: { awr: i + 1 } });
        }

        return NextResponse.json({ success: true, message: "Ranks updated." });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update ranks: " + error }, { status: 500 });
    }
}
