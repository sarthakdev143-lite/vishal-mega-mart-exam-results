import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("vishal-exam");
        const collection = db.collection("results");
        console.log("Fetching Leaderboard..")

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

        console.log("Top 10 : ", top10)

        return NextResponse.json(top10);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
