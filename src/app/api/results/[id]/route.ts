import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    if (!id) {
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    try {
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ObjectID format' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('vishal-exam');
        const collection = db.collection('results');

        const result = await collection.findOne({ _id: new ObjectId(id) });

        if (!result) {
            return NextResponse.json({ message: 'Result not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching result:', error);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}