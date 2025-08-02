"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Users, BookOpen, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function TeacherCourseDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { courseId } = params;

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "teacher")) {
      router.push("/portal/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "teacher" && courseId) {
      const fetchCourseData = async () => {
        setLoading(true);
        try {
          // 1. Fetch the main course document
          const courseDocRef = doc(db, "courses", courseId);
          const courseDocSnap = await getDoc(courseDocRef);

          if (
            courseDocSnap.exists() &&
            courseDocSnap.data().teacherId === user.uid
          ) {
            const courseData = {
              id: courseDocSnap.id,
              ...courseDocSnap.data(),
            };
            setCourse(courseData);

            // 2. Fetch the enrolled students' profiles
            if (
              courseData.enrolledStudents &&
              courseData.enrolledStudents.length > 0
            ) {
              const studentsQuery = query(
                collection(db, "users"),
                where("__name__", "in", courseData.enrolledStudents)
              );
              const studentsSnapshot = await getDocs(studentsQuery);
              const studentsList = studentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setStudents(studentsList);
            }
          } else {
            // Course not found or teacher is not authorized
            setCourse(null);
          }
        } catch (error) {
          console.error("Error fetching course details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourseData();
    }
  }, [user, courseId, router]);

  if (authLoading || loading) {
    return <p className="text-white">Loading course details...</p>;
  }

  if (!course) {
    return (
      <p className="text-white">
        Course not found or you do not have permission to view it.
      </p>
    );
  }

  return (
    <div>
      <Link
        href="/portal/teacher-courses"
        className="text-sm text-brand-gold hover:underline">
        ← Back to All Courses
      </Link>
      <h1 className="text-4xl font-bold text-white mt-2">{course.title}</h1>
      <p className="text-slate mt-1">{course.schedule}</p>

      {/* --- Management Cards --- */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Student Roster Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-white">
              Student Roster ({students.length})
            </h3>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id}
                  className="text-sm text-slate p-2 rounded-md bg-slate-800/20">
                  {student.email}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate">
                No students are currently enrolled.
              </p>
            )}
          </div>
        </div>

        {/* Lesson Plan Card (Placeholder) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-white">Lesson Plan</h3>
          </div>
          <p className="text-sm text-slate">
            Functionality to add and manage lessons will be built here.
          </p>
        </div>

        {/* Analytics Card (Placeholder) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
          </div>
          <p className="text-sm text-slate">
            Student progress charts and course analytics will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
