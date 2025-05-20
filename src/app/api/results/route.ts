import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const SUBJECTS = [
    "securityPoseAesthetics",
    "wrestling",
    "shoppingCartDragRace",
    "auntyCrowdManagement",
    "fakeSirenSound",
];

function generateRealisticMarks() {
    const marks: Record<string, { theory: number; practical: number; }> = {};

    SUBJECTS.forEach((subject) => {
        const theory = Math.floor(Math.random() * 71) + 10; // 10-80
        const practical = Math.floor(Math.random() * 16) + 5; // 10-20
        marks[subject] = { theory, practical };
    });

    console.log(marks)

    return marks;
}

export async function POST(req: NextRequest) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("vishal-exam");
        const collection = db.collection("results");

        const existing = await collection.findOne({ email });
        if (existing) return NextResponse.json(existing);

        const marks = generateRealisticMarks();

        const resultData = {
            name,
            email,
            marks,
            createdAt: new Date(),
        };

        await collection.insertOne(resultData);
        return NextResponse.json(resultData);

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
