"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiPhone, FiBookOpen, FiBriefcase } from "react-icons/fi";

// --- Reusable sub-component for the interactive choice cards ---
const ActionCard = ({ icon, title, description, buttonText, href, delay }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: delay },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col rounded-2xl  bg-dark-navy/40 p-6 text-center backdrop-blur-lg transition-all duration-300 hover:border-brand-gold/50 hover:bg-dark-navy/60">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-dark-navy/80 p-3 backdrop-blur-lg transition-colors duration-300 group-hover:border-brand-gold/50">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-grow text-sm text-slate">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-full bg-brand-gold/10 px-6 py-2 text-sm font-semibold text-brand-gold ring-1 ring-inset ring-brand-gold/20 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-dark-navy">
        {buttonText}
      </Link>
    </motion.div>
  );
};

export default function CTASection() {
  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: 0.8 },
    },
  };

  return (
    // CHANGE 1: Reduced bottom padding from py-24 to pt-24 pb-12 to decrease space below
    <section className="relative mt-24 pt-24 pb-12">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/image2.png')" }}></div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="container relative z-10 mx-auto max-w-5xl">
        <div className="relative rounded-2xl p-8">
          {/* CHANGE 2: Line color changed from via-brand-gold/50 to via-white/25 */}
          <motion.div
            variants={lineVariants}
            className="absolute top-0 left-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
          <motion.div
            variants={lineVariants}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          <motion.h2
            variants={textVariants}
            className="mb-12 text-center text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] sm:text-5xl">
            Begin Your Legacy
          </motion.h2>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
            <ActionCard
              icon={<FiPhone className="h-6 w-6 text-brand-gold" />}
              title="Personalized Consultation"
              description="Discuss your academic goals one-on-one with an expert counselor to find your perfect path."
              buttonText="Schedule a Call"
              href="/contact"
              delay={1.0}
            />
            <ActionCard
              icon={<FiBookOpen className="h-6 w-6 text-brand-gold" />}
              title="Explore the Curriculum"
              description="Take an in-depth look at our world-class courses, teaching methods, and learning resources."
              buttonText="View Courses"
              href="/courses"
              delay={1.2}
            />
            <ActionCard
              icon={<FiBriefcase className="h-6 w-6 text-brand-gold" />}
              title="Join Our Team"
              description="Passionate about education? We're looking for talented individuals to help shape the future."
              buttonText="View Openings"
              href="/careers"
              delay={1.4}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
