"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Home,
  Shield,
  Loader2,
  AlertTriangle,
  Calendar,
  BookOpen,
  School,
  GraduationCap,
  Edit,
  UserCircle,
} from "lucide-react";
// --- CHANGE HERE: Import the new component ---
import ProfileImageUploader from "../../components/ProfileImageUploader";

// --- UI Components (InfoCard, DetailItem, SubjectBadge) remain the same ---
const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
  <motion.div
    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    className={`rounded-2xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-lg ${className}`}>
    <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-3">
      <Icon className="h-6 w-6 text-brand-gold" />
      <h3 className="text-lg font-semibold text-brand-gold tracking-wide">
        {title}
      </h3>
    </div>
    <dl className="space-y-4">{children}</dl>
  </motion.div>
);
const DetailItem = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <dt className="text-slate-400 col-span-1">{label}</dt>
    <dd className="text-light-slate col-span-2">{value || "N/A"}</dd>
  </div>
);
const SubjectBadge = ({ subject }) => (
  <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
    <BookOpen size={12} />
    <span>{subject}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const uploaderRef = useRef(null); // Ref for the new uploader component

  useEffect(() => {
    // Fetch profile logic remains the same
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const docSnap = await getDoc(doc(db, "students", user.uid));
        if (docSnap.exists()) {
          setStudentProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Could not find your student profile.");
        }
      } catch (err) {
        setError("Failed to load your profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePhotoUpdate = async (url) => {
    if (!studentProfile?.id) return;
    try {
      await updateDoc(doc(db, "students", studentProfile.id), {
        photoURL: url,
        updatedAt: Timestamp.now(),
      });
      setStudentProfile((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error("Error updating photo:", err);
    }
  };

  // This function is called by the "Edit" button
  const handleEditPhotoClick = () => {
    uploaderRef.current?.triggerUpload();
  };

  // --- Loading, error, and no profile states remain the same ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate">
          An Error Occurred
        </h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  if (!studentProfile)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <User className="h-12 w-12 text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate">
          No Profile Found
        </h2>
        <p className="text-slate-400">
          We couldn't find a profile associated with your account.
        </p>
      </div>
    );

  const fullAddress = [
    studentProfile.addressStreet,
    studentProfile.addressState,
    studentProfile.addressPincode,
  ]
    .filter(Boolean)
    .join(", ");
  const formatDate = (timestamp) =>
    timestamp ? format(timestamp.toDate(), "dd MMMM yyyy") : "N/A";

  return (
    <main>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        animate="visible">
        {/* --- PROFILE HERO --- */}
        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="relative shrink-0">
            {studentProfile.photoURL ? (
              <img
                src={studentProfile.photoURL}
                alt={studentProfile.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-slate-700/50 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 rounded-full flex items-center justify-center font-bold text-5xl bg-slate-800 border-4 border-slate-700/50 text-brand-gold">
                {studentProfile.name?.charAt(0) || "?"}
              </div>
            )}
            <button
              onClick={handleEditPhotoClick}
              className="absolute bottom-1 right-1 bg-brand-gold text-dark-navy p-2 rounded-full hover:scale-110 transition-transform shadow-md">
              <Edit size={16} />
            </button>
            {/* --- CHANGE HERE: Render the new, invisible uploader --- */}
            <ProfileImageUploader
              ref={uploaderRef}
              onUploadComplete={handlePhotoUpdate}
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {studentProfile.name}
            </h1>
            <p className="text-lg text-brand-gold mt-1">
              {studentProfile.batch}
            </p>
            <p className="text-slate-400">
              Roll No: {studentProfile.rollNumber}
            </p>
          </div>
        </motion.div>

        {/* --- DETAILS GRID (remains the same) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <InfoCard icon={UserCircle} title="Personal & Academic Details">
              <DetailItem label="Username" value={studentProfile.username} />
              <DetailItem
                label="Date of Birth"
                value={formatDate(studentProfile.dob)}
              />
              <DetailItem label="Gender" value={studentProfile.gender} />
              <DetailItem
                label="Admission Date"
                value={formatDate(studentProfile.admissionDate)}
              />
              <DetailItem
                label="Present School"
                value={studentProfile.presentSchool}
              />
            </InfoCard>

            <InfoCard icon={Shield} title="Guardian & Contact Information">
              <DetailItem
                label="Father's Name"
                value={studentProfile.fatherName}
              />
              <DetailItem
                label="Father's Contact"
                value={studentProfile.fatherContact}
              />
              <DetailItem
                label="Mother's Name"
                value={studentProfile.motherName}
              />
              <DetailItem
                label="Mother's Contact"
                value={studentProfile.motherContact}
              />
              <DetailItem
                label="Parent Email"
                value={studentProfile.parentEmail}
              />
              <DetailItem
                label="WhatsApp Number"
                value={studentProfile.whatsappNumber}
              />
              <DetailItem label="Address" value={fullAddress} />
            </InfoCard>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <InfoCard icon={GraduationCap} title="Subjects Opted">
              <div className="flex flex-wrap gap-2">
                {(studentProfile.subjects || []).length > 0 ? (
                  studentProfile.subjects.map((sub) => (
                    <SubjectBadge key={sub} subject={sub} />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No subjects assigned.
                  </p>
                )}
              </div>
            </InfoCard>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
