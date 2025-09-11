"use client";

import { useState } from "react"; // <-- Import useState
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"; // <-- Import icons for feedback

// ContactInfoItem component remains the same
const ContactInfoItem = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
    className="flex items-start gap-4">
    <div className="mt-1 rounded-full bg-brand-gold/10 p-3 ring-1 ring-inset ring-brand-gold/20">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-1 text-slate">{children}</div>
    </div>
  </motion.div>
);

export default function ContactPage() {
  // --- ADDED: State for form management ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/contact-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setStatus({
        type: "success",
        message: "Thank you! Your message has been sent.",
      });
      setFormData({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24">
      <section className="relative py-24">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/image2.png')" }}
        />
        <div className="absolute inset-0 z-10" />

        <div className="container relative z-20 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
              We're here to answer your questions. Reach out, and we'll respond
              as soon as we can.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              {/* Contact Info Items remain the same */}
              <ContactInfoItem
                icon={<FiMail className="h-6 w-6 text-brand-gold" />}
                title="Email Us">
                <a
                  href="mailto:brightsparkedu.23@gmail.com"
                  className="transition-colors hover:text-brand-gold">
                  brightsparkedu.23@gmail.com
                </a>
                <p className="text-sm">We aim to reply within 24 hours.</p>
              </ContactInfoItem>
              <ContactInfoItem
                icon={<FiPhone className="h-6 w-6 text-brand-gold" />}
                title="Call Us">
                <a
                  href="tel:+916375272508"
                  className="transition-colors hover:text-brand-gold">
                  +91 6375272508
                </a>
                <p className="text-sm">Mon - Sat, 4:00 PM - 8:00 PM IST</p>
              </ContactInfoItem>
              <ContactInfoItem
                icon={<FiMapPin className="h-6 w-6 text-brand-gold" />}
                title="Visit Us">
                <p>
                  4th Floor, THD Garden Club House, Thada, Rajasthan, 301707
                </p>
                <p className="text-sm">India</p>
              </ContactInfoItem>
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3517.5253847458907!2d76.80687707553727!3d28.160933205340022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d4972d71c5cf1%3A0x5673ff8986e1d237!2sBrightSpark%20Institute!5e0!3m2!1sen!2sin!4v1757492948326!5m2!1sen!2sin"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Brightspark Institute Location"></iframe>
              </div>
            </div>

            {/* --- UPDATED Right Column: Functional Contact Form --- */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-slate">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"></textarea>
                </div>

                <AnimatePresence>
                  {status.message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center gap-3 rounded-md p-3 text-sm ${
                        status.type === "success"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-red-500/10 text-red-300"
                      }`}>
                      {status.type === "success" ? (
                        <CheckCircle size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}
                      {status.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-brand-gold py-3 font-bold text-dark-navy transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:bg-yellow-700">
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
