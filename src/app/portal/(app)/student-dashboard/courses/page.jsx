
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ClipboardList,
  StickyNote,
  Book,
  UserCheck, // New icon for the teacher
} from "lucide-react";

// --- MOCK DATA ---
const mockStudentProfile = {
  class: "Class VI",
  batch: "Foundation Batch - Evening",
  enrollments: [
    {
      courseId: "math_vi",
      courseName: "Mathematics VI",
      teacher: "Mr. A. K. Sharma",
    },
    {
      courseId: "science_vi",
      courseName: "Science VI",
      teacher: "Mrs. S. Gupta",
    },
  ],
};

const mockEnrolledCourses = [
  {
    id: "math_vi",
    title: "Mathematics VI",
    description:
      "This course covers the foundational concepts of Class VI mathematics as per the NCERT curriculum, focusing on building strong problem-solving skills.",
    topics: [
      "Integers",
      "Fractions & Decimals",
      "Algebra",
      "Geometry",
      "Mensuration",
    ],
    resources: {
      assignments: [
        {
          id: "a1",
          name: "Algebra Exercise 1.pdf",
          date: "2025-08-30",
          type: "pdf",
        },
      ],
      worksheets: [
        {
          id: "w1",
          name: "Chapter 4 Practice Sheet.pdf",
          date: "2025-08-15",
          type: "pdf",
        },
      ],
      books: [
        {
          id: "b1",
          name: "NCERT Mathematics Class VI.pdf",
          date: "2025-08-01",
          type: "pdf",
        },
      ],
      notes: [
        {
          id: "n1",
          name: "Chapter 1-3 Summary Notes.pdf",
          date: "2025-08-10",
          type: "pdf",
        },
      ],
    },
  },
  {
    id: "science_vi",
    title: "Science VI",
    description:
      "Exploring the wonders of science, this course covers key topics in Physics, Chemistry, and Biology to foster a spirit of inquiry.",
    topics: [
      "Food & Its Components",
      "The Living Organisms",
      "Motion & Measurement",
      "Electricity & Circuits",
    ],
    resources: {
      assignments: [
        {
          id: "sa1",
          name: "Photosynthesis Diagram.pdf",
          date: "2025-08-28",
          type: "pdf",
        },
      ],
      worksheets: [],
      books: [
        {
          id: "sb1",
          name: "NCERT Science Class VI.pdf",
          date: "2025-08-01",
          type: "pdf",
        },
      ],
      notes: [
        {
          id: "sn1",
          name: "Notes on The Living Organisms.pdf",
          date: "2025-08-18",
          type: "pdf",
        },
      ],
    },
  },
];

// --- Components (ResourceItem, ResourceWidget) are unchanged ---

const ResourceItem = ({ resource }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50">
    <div className="flex items-center gap-3 overflow-hidden">
      <FileText className="h-5 w-5 text-slate-400 shrink-0" />
      <div className="overflow-hidden">
        <p className="font-medium text-light-slate truncate text-sm">
          {resource.name}
        </p>
        <p className="text-xs text-slate">
          Uploaded:{" "}
          {new Date(resource.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
    <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors shrink-0">
      <Download size={14} />
      <span>Download</span>
    </button>
  </div>
);

const ResourceWidget = ({ title, Icon, resources }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="h-6 w-6 text-brand-gold" />
      <h3 className="text-lg font-semibold text-light-slate">{title}</h3>
    </div>
    <div className="space-y-2">
      {resources.length > 0 ? (
        resources.map((res) => <ResourceItem key={res.id} resource={res} />)
      ) : (
        <p className="text-sm text-slate/70 text-center py-4">
          No {title.toLowerCase()} uploaded yet.
        </p>
      )}
    </div>
  </div>
);

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState(mockEnrolledCourses[0].id);
  const activeCourse = mockEnrolledCourses.find(
    (course) => course.id === activeTab
  );

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        My Courses
      </h1>
      <p className="text-lg text-slate mb-8">
        Your central hub for all course materials and resources.
      </p>

      {/* --- NEW: Enrollment Summary Section --- */}
      <motion.div
        className="mb-8 p-6 rounded-2xl border border-white/10 bg-slate-900/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <p className="text-brand-gold font-semibold">
              {mockStudentProfile.class}
            </p>
            <h2 className="text-2xl font-bold text-light-slate">
              {mockStudentProfile.batch}
            </h2>
          </div>
          <div className="mt-4 sm:mt-0">
            <h3 className="text-md font-semibold text-slate mb-2 text-left sm:text-right">
              Your Subjects:
            </h3>
            <div className="space-y-2">
              {mockStudentProfile.enrollments.map((item) => (
                <div
                  key={item.courseId}
                  className="flex items-center gap-2 justify-start sm:justify-end">
                  <p className="text-sm text-light-slate">{item.courseName}</p>
                  <p className="flex items-center gap-1 text-xs text-slate/80">
                    <UserCheck size={14} />
                    {item.teacher}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/50 mb-6">
        {mockEnrolledCourses.map((course) => (
          <button
            key={course.id}
            onClick={() => setActiveTab(course.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === course.id
                ? "border-b-2 border-brand-gold text-brand-gold"
                : "text-slate hover:text-white"
            }`}>
            {course.title}
          </button>
        ))}
      </div>

      {/* Tab Content (remains the same) */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        {activeCourse && (
          <>
            <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-slate-900/20">
              <h2 className="text-xl font-bold text-light-slate mb-2">
                About {activeCourse.title}
              </h2>
              <p className="text-slate mb-4">{activeCourse.description}</p>
              <h3 className="text-md font-semibold text-slate mb-2">
                Topics Covered:
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeCourse.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs font-medium px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResourceWidget
                title="Assignments"
                Icon={ClipboardList}
                resources={activeCourse.resources.assignments}
              />
              <ResourceWidget
                title="Worksheets"
                Icon={FileText}
                resources={activeCourse.resources.worksheets}
              />
              <ResourceWidget
                title="Notes"
                Icon={StickyNote}
                resources={activeCourse.resources.notes}
              />
              <ResourceWidget
                title="Books"
                Icon={Book}
                resources={activeCourse.resources.books}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}