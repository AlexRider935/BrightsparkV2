"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import {
  FileText,
  Download,
  ClipboardList,
  StickyNote,
  Book,
  UserCheck,
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

// --- CHILD COMPONENTS (Unchanged) ---

const ResourceItem = ({ resource }) => (
  <a
    href={resource.fileURL}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
    <div className="flex items-center gap-3 overflow-hidden">
      <FileText className="h-5 w-5 text-slate-400 shrink-0" />
      <div className="overflow-hidden">
        <p className="font-medium text-light-slate truncate text-sm group-hover:text-brand-gold">
          {resource.name}
        </p>
        <p className="text-xs text-slate">
          Uploaded:{" "}
          {resource.addedAt
            ? new Date(resource.addedAt.toDate()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-slate-300 group-hover:bg-brand-gold group-hover:text-dark-navy transition-colors shrink-0">
      <Download size={14} />
      <span>Download</span>
    </div>
  </a>
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
          No {title.toLowerCase()} uploaded for this subject yet.
        </p>
      )}
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [batchInfo, setBatchInfo] = useState({ subjects: [], teacher: "" });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribeMaterials = () => {};

    const initialize = async () => {
      try {
        // Step 1: Fetch student profile to get their batch name
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists())
          throw new Error("Student profile not found.");

        const studentData = studentSnap.data();
        setStudentProfile(studentData);
        if (!studentData.batch)
          throw new Error("You are not assigned to a batch.");

        // Step 2: Fetch the batch document using the student's batch name
        const batchesQuery = query(
          collection(db, "batches"),
          where("name", "==", studentData.batch)
        );
        const batchSnapshot = await getDocs(batchesQuery);
        if (batchSnapshot.empty)
          throw new Error(
            `Details for your batch ("${studentData.batch}") could not be found.`
          );

        const batchData = batchSnapshot.docs[0].data();

        // Step 3: Extract the array of subject strings and the single teacher name
        const subjects = batchData.subjects || [];
        const teacher = batchData.teacher || "N/A";
        setBatchInfo({ subjects, teacher });

        if (subjects.length > 0) {
          setActiveTab(subjects[0]);
        }

        // Step 4: Listen for all materials assigned to the student's batch
        const materialsQuery = query(
          collection(db, "materials"),
          where("batch", "==", studentData.batch)
        );
        unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
          setMaterials(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
      } catch (err) {
        console.error("Error initializing page:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
    return () => unsubscribeMaterials();
  }, [user]);

  const activeCourseResources = useMemo(() => {
    if (!activeTab) return {};
    const filtered = materials.filter((m) => m.subject === activeTab);
    const lowerCaseCategory = (category) => (category || "").toLowerCase();
    return {
      assignments: filtered.filter(
        (m) => lowerCaseCategory(m.category) === "assignment"
      ),
      worksheets: filtered.filter((m) =>
        ["worksheet", "worksheets"].includes(lowerCaseCategory(m.category))
      ),
      notes: filtered.filter((m) => lowerCaseCategory(m.category) === "notes"),
      books: filtered.filter(
        (m) => lowerCaseCategory(m.category) === "book (pdf)"
      ),
    };
  }, [activeTab, materials]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate mb-2">
          Could Not Load Courses
        </h2>
        <p className="text-slate">{error}</p>
      </div>
    );
  if (!studentProfile)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen className="h-10 w-10 text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate mb-2">
          Loading Profile...
        </h2>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        My Courses
      </h1>
      <p className="text-lg text-slate mb-8">
        Your central hub for all course materials and resources.
      </p>

      <motion.div
        className="mb-8 p-6 rounded-2xl border border-white/10 bg-slate-900/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <p className="text-brand-gold font-semibold">
              {studentProfile.classLevel}
            </p>
            <h2 className="text-2xl font-bold text-light-slate">
              {studentProfile.batch}
            </h2>
          </div>
          {batchInfo.subjects.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <h3 className="text-md font-semibold text-slate mb-2 text-left sm:text-right">
                Your Subjects:
              </h3>
              <div className="space-y-2">
                {batchInfo.subjects.map((subjectName) => (
                  <div
                    key={subjectName}
                    className="flex items-center gap-2 justify-start sm:justify-end">
                    <p className="text-sm text-light-slate">{subjectName}</p>
                    <p className="flex items-center gap-1 text-xs text-slate/80">
                      <UserCheck size={14} />
                      {batchInfo.teacher}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {batchInfo.subjects.length > 0 ? (
        <>
          <div className="flex border-b border-slate-700/50 mb-6 overflow-x-auto">
            {batchInfo.subjects.map((subjectName) => (
              <button
                key={subjectName}
                onClick={() => setActiveTab(subjectName)}
                className={`px-4 py-2 text-sm font-medium transition-colors shrink-0 ${
                  activeTab === subjectName
                    ? "border-b-2 border-brand-gold text-brand-gold"
                    : "text-slate hover:text-white"
                }`}>
                {subjectName}
              </button>
            ))}
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResourceWidget
                title="Assignments"
                Icon={ClipboardList}
                resources={activeCourseResources.assignments || []}
              />
              <ResourceWidget
                title="Worksheets"
                Icon={FileText}
                resources={activeCourseResources.worksheets || []}
              />
              <ResourceWidget
                title="Notes"
                Icon={StickyNote}
                resources={activeCourseResources.notes || []}
              />
              <ResourceWidget
                title="Books"
                Icon={Book}
                resources={activeCourseResources.books || []}
              />
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
          <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">
            No Subjects Enrolled
          </h3>
          <p className="mt-2 text-sm text-slate">
            There are no subjects assigned to your batch yet.
          </p>
        </div>
      )}
    </div>
  );
}
