import { NextResponse } from 'next/server';

export async function GET() {
    console.log("No collections to seed for the Analytics page.");
    return NextResponse.json({
        message: 'No action taken. The Analytics page reads from existing collections and does not require its own seed file.'
    });
}