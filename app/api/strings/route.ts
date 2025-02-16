// app/api/strings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '../../../utils/firestore';

export async function GET(request: NextRequest) {
  try {
    const db = getFirestore();
    // Fetch all documents from the "myStrings" collection
    const snapshot = await db.collection('myStrings').get();

    // Convert each document into a plain object
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error retrieving data' },
      { status: 500 }
    );
  }
}
