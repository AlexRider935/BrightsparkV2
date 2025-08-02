import { NextResponse } from 'next/server';
import { db } from "@/firebase/config";
import { collection, addDoc, writeBatch } from "firebase/firestore";

export async function GET() {
    // Security check: Only allow this to run in a development environment
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ success: false, message: "Seeder is only available in development mode." }, { status: 403 });
    }

    const teachersData = [
        { name: "Mrs. Sharma", title: "Lead Physics Faculty", image: "/team/teacher-1.jpg", bio: "With over 15 years of experience, Mrs. Sharma makes complex physics concepts intuitive and engaging." },
        { name: "Mr. Gupta", title: "Head of Chemistry", image: "/team/teacher-2.jpg", bio: "Mr. Gupta's passion for chemistry is contagious, inspiring students to explore the molecular world." },
        { name: "Ms. Verma", title: "Mathematics Specialist", image: "/team/teacher-3.jpg", bio: "An expert in competitive math, Ms. Verma equips students with the skills to excel in any exam." }
    ];

    try {
        const batch = writeBatch(db);
        const teachersCollection = collection(db, "teachers");
        const teacherRefs = [];

        // Add teachers and get their new document IDs
        for (const teacher of teachersData) {
            const docRef = await addDoc(teachersCollection, teacher);
            teacherRefs.push(docRef.id);
        }

        const coursesData = [
            { category: "foundation", title: "Foundation Program (VI-VIII)", description: "Building strong fundamentals in core subjects.", price: "15,000", duration: "1 Year", schedule: "Mon, Wed, Fri - 5:00 PM", teacherIds: [teacherRefs[2]] },
            { category: "advanced", title: "Advanced Program (IX-X)", description: "In-depth subject mastery and strategic preparation for boards.", price: "20,000", duration: "1 Year", schedule: "Tue, Thu, Sat - 5:00 PM", teacherIds: [teacherRefs[0], teacherRefs[1]] },
            { category: "competitive", title: "Sainik School Entrance Prep", description: "A rigorous and disciplined program to excel in the AISSEE.", price: "25,000", duration: "6 Months", schedule: "Daily - 4:00 PM", teacherIds: [teacherRefs[0], teacherRefs[2]] }
        ];

        const coursesCollection = collection(db, "courses");
        for (const course of coursesData) {
            await addDoc(coursesCollection, { ...course, mode: "Offline Classes" });
        }

        return NextResponse.json({ success: true, message: "Database seeded successfully!" });
    } catch (error) {
        console.error("Error seeding database:", error);
        return NextResponse.json({ success: false, message: "Error seeding database.", error: error.message }, { status: 500 });
    }
}