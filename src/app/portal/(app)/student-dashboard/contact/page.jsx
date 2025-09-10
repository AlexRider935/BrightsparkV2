// src/app/portal/(app)/student-dashboard/contact/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// Reusable component for displaying a contact field
const ContactField = ({ Icon, label, children }) => (
  <div>
    <dt className="flex items-center gap-3 text-sm font-semibold text-brand-gold">
      <Icon size={16} />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 text-base text-light-slate pl-8">{children}</dd>
  </div>
);

export default function ContactPage() {
  const [contactDetails, setContactDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "settings", "contactDetails");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setContactDetails(docSnap.data());
        } else {
          setError(
            "Contact information has not been set up by the administrator."
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching contact details:", err);
        setError("Could not load contact information.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-xl font-semibold text-white">
          An Error Occurred
        </h3>
        <p className="mt-2 text-sm text-slate">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Contact Us
      </h1>
      <p className="text-lg text-slate mb-8">
        We're here to help. Reach out to us with any questions.
      </p>

      {contactDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/20 p-8 backdrop-blur-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}>
            <dl className="space-y-6">
              <ContactField Icon={MapPin} label="Our Address">
                {contactDetails.address}
              </ContactField>
              <ContactField Icon={Phone} label="Phone Number">
                <a
                  href={`tel:${contactDetails.phone}`}
                  className="hover:text-brand-gold transition-colors">
                  {contactDetails.phone}
                </a>
              </ContactField>
              <ContactField Icon={Mail} label="Email Address">
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="hover:text-brand-gold transition-colors">
                  {contactDetails.email}
                </a>
              </ContactField>
              <ContactField Icon={Clock} label="Operating Hours">
                <div className="space-y-1">
                  {contactDetails.hours?.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between text-sm">
                      <span>{item.day}</span>
                      <span className="text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </ContactField>
            </dl>
          </motion.div>

          <motion.div
            className="lg:col-span-3 rounded-2xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3517.5253847458907!2d76.80687707553727!3d28.160933205340022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d4972d71c5cf1%3A0x5673ff8986e1d237!2sBrightSpark%20Institute!5e0!3m2!1sen!2sin!4v1757492948326!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Brightspark Institute Location"></iframe>
          </motion.div>
        </div>
      )}
    </div>
  );
}
