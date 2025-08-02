"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiBook, FiTarget, FiAward, FiCpu } from "react-icons/fi";

// --- Data for all courses ---
const coursesData = [
  {
    id: 1,
    category: "foundation",
    title: "Foundation Program (IV-VIII)",
    description:
      "Building strong fundamentals in core subjects to ensure a solid academic base for future challenges.",
    subjects: ["Mathematics", "Science", "English", "Social Studies"],
  },
  {
    id: 2,
    category: "advanced",
    title: "Advanced Program (IX-X)",
    description:
      "In-depth subject mastery and strategic preparation for board examinations and higher studies.",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
  },
  {
    id: 3,
    category: "competitive",
    title: "Sainik School Entrance Prep",
    description:
      "A rigorous and disciplined program designed to excel in the All India Sainik Schools Entrance Examination (AISSEE).",
    subjects: ["Mathematics", "Intelligence", "English", "General Knowledge"],
  },
  {
    id: 4,
    category: "competitive",
    title: "Olympiad Excellence",
    description:
      "Specialized training to tackle national and international Olympiads in Science (NSO) and Mathematics (IMO).",
    subjects: ["Advanced Maths", "Logical Reasoning", "Physics", "Chemistry"],
  },
  {
    id: 5,
    category: "advanced",
    title: "CBSE Board Exam Mastery",
    description:
      "A focused curriculum with extensive mock tests and doubt-solving sessions to achieve a 100% result.",
    subjects: ["All Core Subjects"],
  },
  {
    id: 6,
    category: "foundation",
    title: "Junior Spark Program (IV-V)",
    description:
      "Igniting curiosity at a young age with interactive learning methods and a focus on creative thinking.",
    subjects: ["General Science", "Mathematics", "English"],
  },
];

const filters = [
  { label: "All Programs", value: "all" },
  { label: "Foundation (IV-VIII)", value: "foundation" },
  { label: "Advanced (IX-X)", value: "advanced" },
  { label: "Competitive Exams", value: "competitive" },
];

const CourseCard = ({ course }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex flex-col rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-lg">
    <div className="flex-grow">
      <p className="text-xs font-semibold text-brand-gold uppercase">
        {course.category}
      </p>
      <h3 className="mt-2 text-xl font-bold text-white">{course.title}</h3>
      <p className="mt-3 text-sm text-slate">{course.description}</p>
    </div>
    <div className="mt-6">
      <p className="text-xs font-semibold text-white mb-2">Subjects Covered:</p>
      <div className="flex flex-wrap gap-2">
        {course.subjects.map((subject) => (
          <span
            key={subject}
            className="rounded-full bg-slate/20 px-2 py-1 text-xs text-slate">
            {subject}
          </span>
        ))}
      </div>
    </div>
    <Link
      href={`/courses/${course.id}`} // This will link to a dynamic page later
      className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold transition-colors hover:text-yellow-300">
      <span>View Details</span>
      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
    </Link>
  </motion.div>
);

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState(coursesData);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredCourses(coursesData);
    } else {
      setFilteredCourses(
        coursesData.filter((course) => course.category === activeFilter)
      );
    }
  }, [activeFilter]);

  return (
    <div className="pt-24 bg-dark-navy">
      {/* --- Section 1: Page Header --- */}
      <section className="relative py-24 text-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/image2.png')", opacity: 0.1 }}
        />
        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Find Your Path to Excellence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate">
              Explore our comprehensive programs designed for every stage of
              your academic journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Section 2: Program Explorer --- */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Filter Buttons */}
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeFilter === filter.value
                    ? "bg-brand-gold text-dark-navy"
                    : "bg-slate/10 text-slate hover:bg-slate/20 hover:text-white"
                }`}>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
