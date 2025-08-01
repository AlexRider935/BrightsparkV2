"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BookCopy } from "lucide-react";

// A reusable card component for displaying a single course
const CourseCard = ({ course }) => (
  <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all duration-300 hover:border-brand-gold/50 hover:bg-white/10">
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-white">{course.title}</h3>
      <p className="text-sm text-slate mt-1">Taught by {course.teacherName}</p>
    </div>
    <div className="mt-4">
      <p className="text-xs text-slate mb-2">Progress</p>
      <div className="w-full bg-slate/20 rounded-full h-2">
        <div
          className="bg-brand-gold h-2 rounded-full"
          style={{ width: "45%" }}></div>{" "}
        {/* Placeholder progress */}
      </div>
      <Link
        href={`/portal/courses/${course.id}`}
        className="block w-full text-center mt-4 rounded-lg bg-slate/20 py-2 text-sm font-bold text-slate transition-colors hover:bg-brand-gold hover:text-dark-navy">
        Go to Course
      </Link>
    </div>
  </div>
);

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // This effect handles redirection if the user is not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/portal/login");
    }
  }, [user, authLoading, router]);

  // This effect fetches the user's enrolled courses from Firestore
  useEffect(() => {
    if (user) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          // Create a query to find courses where the 'enrolledStudents' array contains the user's UID
          const coursesRef = collection(db, "courses");
          const q = query(
            coursesRef,
            where("enrolledStudents", "array-contains", user.uid)
          );

          const querySnapshot = await getDocs(q);
          const userCourses = [];
          querySnapshot.forEach((doc) => {
            userCourses.push({ id: doc.id, ...doc.data() });
          });
          setCourses(userCourses);
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
        <BookCopy className="h-8 w-8 text-brand-gold" />
        <h1 className="text-4xl font-bold text-white">My Courses</h1>
      </div>

      {loading ? (
        <p className="text-slate">Loading your courses...</p>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-slate">
          You are not currently enrolled in any courses.
        </p>
      )}
    </div>
  );
}
