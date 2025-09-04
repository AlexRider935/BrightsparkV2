"use client";

import { motion } from "framer-motion";
import {
  User,
  Edit,
  Phone,
  Mail,
  Home,
  BookCopy,
  Users,
  Calendar,
  Award,
} from "lucide-react";
import Image from "next/image";

// --- MOCK DATA ---
const mockTeacherProfile = {
  name: "Mr. A. K. Sharma",
  title: "Senior Mathematics Faculty",
  profilePictureUrl: "", // Using a placeholder
  bio: "An experienced mathematics educator with over 15 years of experience in helping students excel in competitive exams and develop a strong conceptual understanding.",
  employeeId: "BS-T001",
  dateOfJoining: new Date("2018-07-15"),
  subjects: ["Mathematics", "Physics"],
  batches: ["Class VI - Foundation", "Class VII - Olympiad"],
  contact: {
    phone: "+91 91234 56789",
    email: "ak.sharma@brightspark.space",
  },
  address: "123 Teacher's Quarters, Jagatpura, Jaipur, Rajasthan - 302017",
};

// --- Reusable Components ---

// For simple key-value pairs
const ProfileField = ({ Icon, label, value, href }) => (
  <div>
    <dt className="flex items-center gap-2 text-sm font-medium text-slate">
      <Icon size={14} />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 text-base text-light-slate">
      {href ? (
        <a href={href} className="hover:text-brand-gold transition-colors">
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);

// NEW: A component specifically for rendering lists of tags
const ProfileListField = ({ Icon, label, items }) => (
  <div>
    <dt className="flex items-center gap-2 text-sm font-medium text-slate">
      <Icon size={14} />
      <span>{label}</span>
    </dt>
    <dd className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs font-medium px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">
          {item}
        </span>
      ))}
    </dd>
  </div>
);

export default function TeacherProfilePage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        My Profile
      </h1>
      <p className="text-lg text-slate mb-8">
        Your professional and contact details on record.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg text-center flex flex-col h-full">
            <div className="relative w-32 h-32 mx-auto shrink-0">
              <Image
                src={mockTeacherProfile.profilePictureUrl}
                alt="Profile Picture"
                fill
                className="rounded-full object-cover border-2 border-brand-gold/50"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              {mockTeacherProfile.name}
            </h2>
            <p className="text-brand-gold text-sm">
              {mockTeacherProfile.title}
            </p>
            <p className="text-xs text-slate mt-4 border-t border-slate-700/50 pt-4 flex-grow">
              {mockTeacherProfile.bio}
            </p>
            <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </motion.div>

        {/* Right Column: Detailed Information */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          {/* Professional Details Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Professional Information
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <ProfileField
                Icon={Award}
                label="Employee ID"
                value={mockTeacherProfile.employeeId}
              />
              <ProfileField
                Icon={Calendar}
                label="Date of Joining"
                value={mockTeacherProfile.dateOfJoining.toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              />
              {/* Using the new ProfileListField for cleaner code */}
              <ProfileListField
                Icon={BookCopy}
                label="Subjects Taught"
                items={mockTeacherProfile.subjects}
              />
              <ProfileListField
                Icon={Users}
                label="Batches Assigned"
                items={mockTeacherProfile.batches}
              />
            </dl>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">
              Contact Information
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {/* Contact details are now clickable links */}
              <ProfileField
                Icon={Phone}
                label="Phone Number"
                value={mockTeacherProfile.contact.phone}
                href={`tel:${mockTeacherProfile.contact.phone}`}
              />
              <ProfileField
                Icon={Mail}
                label="Email Address"
                value={mockTeacherProfile.contact.email}
                href={`mailto:${mockTeacherProfile.contact.email}`}
              />
              <div className="sm:col-span-2">
                <ProfileField
                  Icon={Home}
                  label="Address"
                  value={mockTeacherProfile.address}
                />
              </div>
            </dl>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { db } from "@/firebase/config";
// import { collection, onSnapshot, doc, updateDoc, query, where, Timestamp } from "firebase/firestore";
// import { User, Edit, Phone, Mail, Home, BookCopy, Users, Calendar, Award, Loader2, X } from "lucide-react";
// import Image from "next/image"; // Keep this if you plan to add image URLs to Firestore

// // --- Reusable Components ---
// const ProfileField = ({ Icon, label, value, href }) => (
//   <div>
//     <dt className="flex items-center gap-2 text-sm font-medium text-slate"><Icon size={14} /><span>{label}</span></dt>
//     <dd className="mt-1 text-base text-light-slate">{href ? <a href={href} className="hover:text-brand-gold transition-colors">{value}</a> : value}</dd>
//   </div>
// );

// const ProfileListField = ({ Icon, label, items }) => (
//   <div>
//     <dt className="flex items-center gap-2 text-sm font-medium text-slate"><Icon size={14} /><span>{label}</span></dt>
//     <dd className="mt-2 flex flex-wrap gap-2">{items.map((item) => (<span key={item} className="text-xs font-medium px-2 py-1 rounded-full bg-slate-500/20 text-slate-300">{item}</span>))}</dd>
//   </div>
// );

// const ProfileEditModal = ({ isOpen, onClose, onSave, teacher }) => {
//     const [formData, setFormData] = useState({});
//     const [isSaving, setIsSaving] = useState(false);

//     useEffect(() => {
//         if (teacher) {
//             setFormData({
//                 bio: teacher.bio || "",
//                 contact: teacher.contact || "",
//                 email: teacher.email || "",
//                 address: teacher.address || "",
//             });
//         }
//     }, [teacher, isOpen]);
    
//     const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         await onSave(formData);
//         setIsSaving(false);
//         onClose();
//     };

//     if (!isOpen) return null;

//     return (
//         <AnimatePresence>
//             <motion.div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <motion.div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-dark-navy/80 p-6 shadow-2xl" initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: 20 }}>
//                     <h2 className="text-xl font-bold text-brand-gold mb-6">Edit Your Profile</h2>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div><label className="block text-sm font-medium text-slate mb-2">Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="form-input"/></div>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div><label className="block text-sm font-medium text-slate mb-2">Contact Phone</label><input name="contact" type="tel" value={formData.contact} onChange={handleChange} className="form-input"/></div>
//                             <div><label className="block text-sm font-medium text-slate mb-2">Contact Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="form-input"/></div>
//                         </div>
//                         <div><label className="block text-sm font-medium text-slate mb-2">Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="form-input"/></div>
//                         <div className="flex justify-end gap-3 pt-4">
//                             <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20">Cancel</button>
//                             <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-md bg-brand-gold text-dark-navy hover:bg-yellow-400 disabled:bg-slate-600">
//                                 {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
//                             </button>
//                         </div>
//                     </form>
//                     <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X size={20} /></button>
//                 </motion.div>
//             </motion.div>
//         </AnimatePresence>
//     );
// };


// export default function TeacherProfilePage() {
//   const [teacher, setTeacher] = useState(null);
//   const [teacherBatches, setTeacherBatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
  
//   const teacherName = "Mr. A. K. Sharma"; // Hardcoded placeholder for current user

//   useEffect(() => {
//     setLoading(true);
//     // Fetch the specific teacher's profile
//     const qTeacher = query(collection(db, "teachers"), where("name", "==", teacherName));
//     const unsubTeacher = onSnapshot(qTeacher, (snapshot) => {
//         if (!snapshot.empty) {
//             const teacherData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
//             setTeacher(teacherData);
//         } else {
//             console.log("Teacher not found!");
//         }
//         setLoading(false);
//     });

//     // Fetch batches to find which ones this teacher is assigned to
//     const qBatches = query(collection(db, "batches"), where("teacher", "==", teacherName));
//     const unsubBatches = onSnapshot(qBatches, (snapshot) => {
//         setTeacherBatches(snapshot.docs.map(doc => doc.data().name));
//     });

//     return () => { unsubTeacher(); unsubBatches(); };
//   }, [teacherName]);
  
//   const handleSave = async (formData) => {
//       if (!teacher) return;
//       try {
//           const teacherRef = doc(db, "teachers", teacher.id);
//           await updateDoc(teacherRef, formData);
//       } catch (error) {
//           console.error("Error updating profile:", error);
//       }
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>;
//   }
  
//   if (!teacher) {
//       return <div className="text-center py-20 text-slate">Could not load teacher profile.</div>
//   }

//   return (
//     <div>
//       <style jsx global>{`.form-input { @apply w-full appearance-none cursor-pointer rounded-lg border border-white/10 bg-slate-900/50 p-3 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-200; }`}</style>
//       <ProfileEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} teacher={teacher} />

//       <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">My Profile</h1>
//       <p className="text-lg text-slate mb-8">Your professional and contact details on record.</p>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
//           <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg text-center flex flex-col h-full">
//             <div className="relative w-32 h-32 mx-auto shrink-0">
//                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-5xl font-bold text-brand-gold border-2 border-brand-gold/50">
//                  {teacher.name.charAt(0)}
//                </div>
//             </div>
//             <h2 className="mt-4 text-2xl font-bold text-white">{teacher.name}</h2>
//             <p className="text-brand-gold text-sm">{teacher.title || "Faculty"}</p>
//             <p className="text-sm text-slate mt-4 border-t border-slate-700/50 pt-4 flex-grow">{teacher.bio || "No bio provided."}</p>
//             <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-brand-gold hover:text-dark-navy transition-colors">
//               <Edit size={16} /><span>Edit Profile</span>
//             </button>
//           </div>
//         </motion.div>

//         <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
//             <h3 className="text-lg font-semibold text-brand-gold mb-4">Professional Information</h3>
//             <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
//               <ProfileField Icon={Award} label="Employee ID" value={teacher.employeeId} />
//               <ProfileField Icon={Calendar} label="Date of Joining" value={teacher.createdAt ? format(teacher.createdAt.toDate(), "dd MMM, yyyy") : 'N/A'}/>
//               <ProfileListField Icon={BookCopy} label="Subjects Taught" items={teacher.subjects || []}/>
//               <ProfileListField Icon={Users} label="Batches Assigned" items={teacherBatches || []}/>
//             </dl>
//           </div>

//           <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
//             <h3 className="text-lg font-semibold text-brand-gold mb-4">Contact Information</h3>
//             <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
//               <ProfileField Icon={Phone} label="Phone Number" value={teacher.contact} href={`tel:${teacher.contact}`} />
//               <ProfileField Icon={Mail} label="Email Address" value={teacher.email || 'Not provided'} href={teacher.email ? `mailto:${teacher.email}` : '#'}/>
//               <div className="sm:col-span-2"><ProfileField Icon={Home} label="Address" value={teacher.address || 'Not provided'}/></div>
//             </dl>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }