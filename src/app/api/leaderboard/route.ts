import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("vishal-exam");
        const collection = db.collection("results");

        const top10 = await collection
            .find({})
            .sort({ totalMarks: -1 })
            .limit(10)
            .project({
                _id: 0,
                name: 1,
                totalMarks: 1,
                percentage: 1,
                awr: 1,
            })
            .toArray();


        return NextResponse.json(top10);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
