"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

// --- MOCK DATA ---
const contactDetails = {
  address: "Plot 123, Knowledge Park, Near SKIT College, Jagatpura, Jaipur, Rajasthan 302017",
  phone: "+91 98765 43210",
  email: "info@brightspark.space",
  hours: [
    { day: "Monday - Friday", time: "9:00 AM - 7:00 PM" },
    { day: "Saturday", time: "10:00 AM - 4:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};

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
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">Contact Us</h1>
      <p className="text-lg text-slate mb-8">
        We're here to help. Reach out to us with any questions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Contact Details */}
        <motion.div
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/20 p-8 backdrop-blur-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <dl className="space-y-6">
            <ContactField Icon={MapPin} label="Our Address">
              {contactDetails.address}
            </ContactField>
            <ContactField Icon={Phone} label="Phone Number">
              <a href={`tel:${contactDetails.phone}`} className="hover:text-brand-gold transition-colors">{contactDetails.phone}</a>
            </ContactField>
            <ContactField Icon={Mail} label="Email Address">
              <a href={`mailto:${contactDetails.email}`} className="hover:text-brand-gold transition-colors">{contactDetails.email}</a>
            </ContactField>
            <ContactField Icon={Clock} label="Operating Hours">
              <div className="space-y-1">
                {contactDetails.hours.map(item => (
                  <div key={item.day} className="flex justify-between text-sm">
                    <span>{item.day}</span>
                    <span className="text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </ContactField>
          </dl>
        </motion.div>

        {/* Right Column: Embedded Map */}
        <motion.div
          className="lg:col-span-3 rounded-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Using an embedded Google Map. Replace the `src` with your actual institute's location embed link. */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113998.81577908643!2d75.79257608246837!3d26.79155209384504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396dc915a5134b39%3A0x651585350848246!2sJagatpura%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1693654321098"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '400px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Brightspark Institute Location"
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
}