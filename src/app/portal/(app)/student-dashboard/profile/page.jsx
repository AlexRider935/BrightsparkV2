"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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
  Gift,
  Percent,
  Star,
  Edit,
} from "lucide-react";
import ImageUploader from "../../components/ImageUploader";
// --- HELPER & UI COMPONENTS ---

const UserAvatar = ({ name, imageUrl, size = "xl" }) => {
  const sizeClasses = { xl: "w-36 h-36", lg: "w-24 h-24", md: "w-12 h-12" };
  const fontClasses = { xl: "text-5xl", lg: "text-3xl", md: "text-lg" };
  if (imageUrl)
    return (
      <img
        src={imageUrl}
        alt={name || "Profile Picture"}
        className={`rounded-full object-cover border-4 border-slate-700/50 shadow-lg ${sizeClasses[size]}`}
      />
    );
  const getInitials = (n) => {
    if (!n) return "?";
    const parts = n.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1])
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (n) return n.substring(0, 2).toUpperCase();
    return "?";
  };
  const getColor = (n) => {
    const colors = [
      "bg-red-900/50 text-red-300",
      "bg-green-900/50 text-green-300",
      "bg-blue-900/50 text-blue-300",
      "bg-yellow-900/50 text-yellow-300",
      "bg-indigo-900/50 text-indigo-300",
      "bg-purple-900/50 text-purple-300",
      "bg-pink-900/50 text-pink-300",
    ];
    if (!n) return colors[0];
    const charCodeSum = n
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-bold shrink-0 border-4 border-slate-700/50 shadow-lg ${
        sizeClasses[size]
      } ${fontClasses[size]} ${getColor(name || "")}`}>
      <span>{getInitials(name || "")}</span>
    </div>
  );
};

const ProfileField = ({ Icon, label, value }) => (
  <div className="flex flex-col gap-1">
    <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
      <Icon size={14} />
      <span>{label}</span>
    </dt>
    <dd className="text-base text-light-slate pl-6">{value || "N/A"}</dd>
  </div>
);

const SubjectBadge = ({ subject }) => (
  <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
    <BookOpen size={12} />
    <span>{subject}</span>
  </div>
);

const ProfileStat = ({ value, label, Icon }) => (
  <div className="text-center">
    <Icon className="h-8 w-8 text-brand-gold mx-auto mb-2" />
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const studentDocRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
          setStudentProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Could not find your student profile.");
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
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
      const studentDocRef = doc(db, "students", studentProfile.id);
      await updateDoc(studentDocRef, {
        photoURL: url,
        updatedAt: Timestamp.now(),
      });
      setStudentProfile((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error("Error updating photo:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-light-slate">
          An Error Occurred
        </h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }
  if (!studentProfile) {
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
  }

  const fullAddress = [
    studentProfile.addressStreet,
    studentProfile.addressState,
    studentProfile.addressPincode,
  ]
    .filter(Boolean)
    .join(", ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <main>
      {/* --- PROFILE HERO CARD --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <motion.div
          variants={itemVariants}
          className="relative rounded-2xl border border-white/10 bg-slate-900/30 p-8 backdrop-blur-lg overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 group relative">
              <UserAvatar
                name={studentProfile.name}
                imageUrl={studentProfile.photoURL}
                size="xl"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageUploader onUploadComplete={handlePhotoUpdate} />
              </div>
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
            <div className="w-full md:w-auto grid grid-cols-3 gap-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              {/* NOTE: These stats are placeholders. They need to be connected to real data later. */}
              <ProfileStat value="94%" label="Attendance" Icon={Percent} />
              <ProfileStat value="8.2" label="Avg. Grade" Icon={Star} />
              <ProfileStat value="3" label="Assignments Due" Icon={BookOpen} />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- PERSONAL & GUARDIAN DETAILS --- */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Personal & Guardian Details
            </h3>
            <dl className="space-y-6">
              <ProfileField
                Icon={User}
                label="Login Username"
                value={studentProfile.username}
              />
              <ProfileField
                Icon={Gift}
                label="Date of Birth"
                value={
                  studentProfile.dob instanceof Timestamp
                    ? studentProfile.dob.toDate().toLocaleDateString("en-GB")
                    : "N/A"
                }
              />
              <ProfileField
                Icon={User}
                label="Gender"
                value={studentProfile.gender}
              />
              <div className="pt-4 border-t border-slate-700/50">
                <ProfileField
                  Icon={Shield}
                  label="Father's Name"
                  value={studentProfile.fatherName}
                />
              </div>
              <ProfileField
                Icon={Phone}
                label="Father's Contact"
                value={studentProfile.fatherContact}
              />
              <div className="pt-4 border-t border-slate-700/50">
                <ProfileField
                  Icon={Shield}
                  label="Mother's Name"
                  value={studentProfile.motherName}
                />
              </div>
              <ProfileField
                Icon={Phone}
                label="Mother's Contact"
                value={studentProfile.motherContact}
              />
              <div className="pt-4 border-t border-slate-700/50">
                <ProfileField
                  Icon={Mail}
                  label="Parent Email"
                  value={studentProfile.parentEmail}
                />
              </div>
              <ProfileField
                Icon={Phone}
                label="WhatsApp Number"
                value={studentProfile.whatsappNumber}
              />
              <div className="pt-4 border-t border-slate-700/50">
                <ProfileField Icon={Home} label="Address" value={fullAddress} />
              </div>
            </dl>
          </div>

          {/* --- ACADEMIC DETAILS --- */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Academic Details
            </h3>
            <dl className="space-y-6">
              <ProfileField
                Icon={GraduationCap}
                label="Batch"
                value={studentProfile.batch}
              />
              <ProfileField
                Icon={Calendar}
                label="Admission Date"
                value={
                  studentProfile.admissionDate instanceof Timestamp
                    ? studentProfile.admissionDate
                        .toDate()
                        .toLocaleDateString("en-GB")
                    : "N/A"
                }
              />
              <ProfileField
                Icon={School}
                label="Present School"
                value={studentProfile.presentSchool}
              />
              <div className="pt-4 border-t border-slate-700/50">
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  <BookOpen size={14} />
                  <span>Subjects</span>
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {(studentProfile.subjects || []).map((sub) => (
                    <SubjectBadge key={sub} subject={sub} />
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
