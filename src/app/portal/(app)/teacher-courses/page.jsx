"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ClipboardCheck, Users } from "lucide-react";

const TeacherCourseCard = ({ course }) => (
  <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-white">{course.title}</h3>
      <p className="text-sm text-slate mt-1">{course.schedule}</p>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-slate">
        <Users className="h-4 w-4" />
        <span>{course.enrolledStudents?.length || 0} Student(s)</span>
      </div>
      <Link
        href={`/portal/teacher-courses/${course.id}`}
        className="rounded-lg bg-slate/20 px-4 py-2 text-xs font-bold text-slate transition-colors hover:bg-brand-gold hover:text-dark-navy">
        Manage Course
      </Link>
    </div>
  </div>
);

export default function TeacherCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "teacher")) {
      router.push("/portal/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "teacher") {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const coursesRef = collection(db, "courses");
          const q = query(coursesRef, where("teacherId", "==", user.uid));

          const querySnapshot = await getDocs(q);
          const teacherCourses = [];
          querySnapshot.forEach((doc) => {
            teacherCourses.push({ id: doc.id, ...doc.data() });
          });
          setCourses(teacherCourses);
        } catch (error) {
          console.error("Error fetching courses: ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ClipboardCheck className="h-8 w-8 text-brand-gold" />
        <h1 className="text-4xl font-bold text-white">My Courses</h1>
      </div>

      {loading ? (
        <p className="text-slate">Loading your assigned courses...</p>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <TeacherCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-slate">
          You are not currently assigned to any courses.
        </p>
      )}
    </div>
  );
}
