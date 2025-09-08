import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin-config";
import { Timestamp } from "firebase-admin/firestore";

// This is the structure for your events.
// 'batches' is an array: empty for all students, or with names for specific batches.
const mockEvents = [
    {
        title: "Parent-Teacher Meeting",
        type: "PTM", // Use simple keys: 'Holiday', 'Test', 'PTM', 'Event'
        startDate: Timestamp.fromDate(new Date("2025-09-20T10:00:00")),
        endDate: null,
        description: "Discussion of mid-term progress for all batches.",
        batches: [], // Targets all batches
        affectsAttendance: false,
        assessmentId: null,
    },
    {
        title: "Mid-Term Test (Physics)",
        type: "Test",
        startDate: Timestamp.fromDate(new Date("2025-10-06T09:00:00")),
        endDate: null,
        description: "Test covering chapters 1-5 for First Batch.",
        batches: ["First Batch"], // Targets only this batch
        affectsAttendance: false,
        assessmentId: "PHY_MID_2025", // A link for future results integration
    },
    {
        title: "Diwali Break",
        type: "Holiday",
        startDate: Timestamp.fromDate(new Date("2025-10-21T00:00:00")),
        endDate: Timestamp.fromDate(new Date("2025-10-25T23:59:59")), // Multi-day event
        description: "The institute will be closed for Diwali.",
        batches: [],
        affectsAttendance: true, // For future attendance logic
        assessmentId: null,
    },
    {
        title: "Annual Science Fair",
        type: "Event",
        startDate: Timestamp.fromDate(new Date("2025-11-08T11:00:00")),
        endDate: null,
        description: "Showcase of innovative student projects.",
        batches: [],
        affectsAttendance: false,
        assessmentId: null,
    },
];

export async function GET() {
    try {
        const collectionRef = adminDb.collection("events");
        const snapshot = await collectionRef.limit(1).get();

        if (!snapshot.empty) {
            return NextResponse.json({ message: "The 'events' collection is already seeded." }, { status: 200 });
        }

        const batch = adminDb.batch();
        mockEvents.forEach((event) => {
            const docRef = collectionRef.doc();
            batch.set(docRef, event);
        });

        await batch.commit();

        return NextResponse.json({ message: `Successfully seeded ${mockEvents.length} events!` }, { status: 201 });
    } catch (error) {
        console.error("Error seeding events:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}