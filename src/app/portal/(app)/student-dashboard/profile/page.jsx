"use client";

import { motion } from "framer-motion";
import { User, Edit, Phone, Mail, Home, Shield } from "lucide-react";
import Image from "next/image";

// --- MOCK DATA ---
const mockStudentProfile = {
  name: "Alex Rider",
  profilePictureUrl: "", // Using a placeholder
  class: "Class VI",
  batch: "Foundation Batch - Evening",
  rollNumber: "B12-07",
  dateOfBirth: new Date("2013-05-15"),
  contactNumber: "+91 98765 43210",
  email: "alex.rider@example.com",
  address: "123 Learning Lane, Jagatpura, Jaipur, Rajasthan - 302022",
  parent: {
    name: "Ian Rider",
    relation: "Father",
    contactNumber: "+91 87654 32109",
  },
};

// Reusable component for displaying a field in the profile
const ProfileField = ({ Icon, label, value }) => (
  <div>
    <dt className="flex items-center gap-2 text-sm font-medium text-slate">
      <Icon size={14} />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 text-base text-light-slate">{value}</dd>
  </div>
);


export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">My Profile</h1>
      <p className="text-lg text-slate mb-8">
        Your personal and academic details on record.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary */}
        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg text-center">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={mockStudentProfile.profilePictureUrl}
                alt="Profile Picture"
                fill
                className="rounded-full object-cover border-2 border-brand-gold/50"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">{mockStudentProfile.name}</h2>
            <p className="text-brand-gold">{mockStudentProfile.batch}</p>
            <p className="text-slate text-sm">{mockStudentProfile.class}</p>

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
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Personal Details Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">Personal Details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <ProfileField Icon={User} label="Roll Number" value={mockStudentProfile.rollNumber} />
              <ProfileField Icon={User} label="Date of Birth" value={mockStudentProfile.dateOfBirth.toLocaleDateString('en-GB')} />
              <ProfileField Icon={Phone} label="Contact Number" value={mockStudentProfile.contactNumber} />
              <ProfileField Icon={Mail} label="Email Address" value={mockStudentProfile.email} />
              <div className="sm:col-span-2">
                <ProfileField Icon={Home} label="Address" value={mockStudentProfile.address} />
              </div>
            </dl>
          </div>

          {/* Guardian Details Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-brand-gold mb-4">Parent / Guardian Details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <ProfileField Icon={Shield} label="Guardian Name" value={mockStudentProfile.parent.name} />
              <ProfileField Icon={Shield} label="Relation" value={mockStudentProfile.parent.relation} />
              <ProfileField Icon={Phone} label="Guardian Contact" value={mockStudentProfile.parent.contactNumber} />
            </dl>
          </div>
        </motion.div>
      </div>
    </div>
  );
}