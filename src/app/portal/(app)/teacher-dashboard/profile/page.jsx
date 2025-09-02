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
