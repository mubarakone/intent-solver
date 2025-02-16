// app/api/publish/route.ts (modified for an array)
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '../../../utils/firestore';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json(); // expecting { messages: [ "string1", "string2" ] }

    // Optional: check if it's an array of length 2
    if (!Array.isArray(messages) || messages.length !== 2) {
      return NextResponse.json(
        { error: 'Please provide an array of two strings under "messages"' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    await db.collection('myStrings').add({
      messages,
      timestamp: Date.now(),
    });

    return NextResponse.json({ status: 'success', message: 'Strings published' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong storing the strings' },
      { status: 500 }
    );
  }
}