import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import axios from "axios";

const SUBJECTS = [
    "securityPoseAesthetics",
    "wrestling",
    "shoppingCartDragRace",
    "auntyCrowdManagement",
    "fakeSirenSound",
];

function generateRealisticMarks() {
    const marks: { [key: string]: { theory: number; practical: number } } = {};

    SUBJECTS.forEach((subject) => {
        const theory = Math.floor(Math.random() * 71) + 10; // 10-80
        const practical = Math.floor(Math.random() * 16) + 5; // 5-20
        marks[subject] = { theory, practical };
    });

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

        if (existing) {
            if (existing.name.toLowerCase() !== name.toLowerCase()) {
                // Important: Use status 200 instead of 409 to ensure the client doesn't treat this as an error 
                // (though it is but still if the code works, don't touch it)
                return NextResponse.json({
                    message: "Email already associated with a different name: " + existing.name,
                    exists: true,
                    name: existing.name,
                    email: existing.email,
                    _id: existing._id
                }, { status: 200 });
            }

            // If name matches, just return the existing record
            return NextResponse.json(existing);
        }

        const marks = generateRealisticMarks();

        const subjectKeys = Object.keys(marks);
        const totalMarks = subjectKeys.reduce((sum, key) => {
            const subject = marks[key];
            return sum + (subject.theory || 0) + (subject.practical || 0);
        }, 0);

        const percentage = parseFloat(((totalMarks / 500) * 100).toFixed(2));

        const resultData = {
            name,
            email,
            marks,
            totalMarks,
            percentage,
            awr: null, // will be filled later 
            createdAt: new Date(),
        };

        const result = await collection.insertOne(resultData);

        // Fetch all results and reassign ranks
        const results = await collection.find({}).sort({ totalMarks: -1 }).toArray();

        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            await collection.updateOne({ _id: r._id }, { $set: { awr: i + 1 } });
        }

        return NextResponse.json({
            ...resultData,
            _id: result.insertedId
        });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}