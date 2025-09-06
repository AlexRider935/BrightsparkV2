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
  Edit,
  UserCircle,
  Users,
  Landmark,
  Briefcase,
} from "lucide-react";
import ProfileImageUploader from "../../components/ProfileImageUploader";

// --- UI Components ---
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
    <dd className="text-light-slate col-span-2 break-words">
      {value || "N/A"}
    </dd>
  </div>
);

const Badge = ({ text }) => (
  <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
    <span>{text}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const uploaderRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const teacherDocRef = doc(db, "teachers", user.uid);
        const docSnap = await getDoc(teacherDocRef);
        if (docSnap.exists()) {
          setTeacherProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Could not find your teacher profile.");
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
    if (!teacherProfile?.id) return;
    try {
      const teacherDocRef = doc(db, "teachers", teacherProfile.id);
      await updateDoc(teacherDocRef, {
        photoURL: url,
        updatedAt: Timestamp.now(),
      });
      setTeacherProfile((prev) => ({ ...prev, photoURL: url }));
    } catch (err) {
      console.error("Error updating photo:", err);
    }
  };

  const handleEditPhotoClick = () => {
    uploaderRef.current?.triggerUpload();
  };

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
  if (!teacherProfile)
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
    teacherProfile.addressStreet,
    teacherProfile.addressState,
    teacherProfile.addressPincode,
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
            {teacherProfile.photoURL ? (
              <img
                src={teacherProfile.photoURL}
                alt={teacherProfile.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-slate-700/50 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 rounded-full flex items-center justify-center font-bold text-5xl bg-slate-800 border-4 border-slate-700/50 text-brand-gold">
                {teacherProfile.name?.charAt(0) || "?"}
              </div>
            )}
            <button
              onClick={handleEditPhotoClick}
              className="absolute bottom-1 right-1 bg-brand-gold text-dark-navy p-2 rounded-full hover:scale-110 transition-transform shadow-md">
              <Edit size={16} />
            </button>
            <ProfileImageUploader
              ref={uploaderRef}
              onUploadComplete={handlePhotoUpdate}
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {teacherProfile.name}
            </h1>
            <p className="text-lg text-brand-gold mt-1">
              Employee ID: {teacherProfile.employeeId}
            </p>
            <p className="text-slate-400">
              Joined on: {formatDate(teacherProfile.joiningDate)}
            </p>
          </div>
        </motion.div>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <InfoCard icon={UserCircle} title="Personal & Contact Details">
              <DetailItem label="Login Email" value={teacherProfile.email} />
              <DetailItem
                label="Date of Birth"
                value={formatDate(teacherProfile.dob)}
              />
              <DetailItem
                label="Guardian's Name"
                value={teacherProfile.guardianName}
              />
              <DetailItem label="Phone Number" value={teacherProfile.contact} />
              <DetailItem
                label="WhatsApp Number"
                value={teacherProfile.whatsappNumber}
              />
              <DetailItem label="Address" value={fullAddress} />
            </InfoCard>

            <InfoCard icon={Landmark} title="Financial Details">
              <DetailItem label="Bank Name" value={teacherProfile.bankName} />
              <DetailItem
                label="Account Holder"
                value={teacherProfile.accountHolderName}
              />
              <DetailItem
                label="Account Number"
                value={teacherProfile.accountNumber}
              />
              <DetailItem label="IFSC Code" value={teacherProfile.ifscCode} />
              <DetailItem label="UPI Number" value={teacherProfile.upiNumber} />
            </InfoCard>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <InfoCard icon={Briefcase} title="Professional Assignments">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Subjects Taught
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(teacherProfile.subjects || []).length > 0 ? (
                      teacherProfile.subjects.map((sub) => (
                        <Badge key={sub} text={sub} />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No subjects assigned.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Batches Assigned
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(teacherProfile.batches || []).length > 0 ? (
                      teacherProfile.batches.map((b) => (
                        <Badge key={b} text={b} />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No batches assigned.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
