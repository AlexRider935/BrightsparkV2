"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Presentation, ArrowRight } from "lucide-react";

// --- The improved, reusable card component ---
const LoginRoleCard = ({
  href,
  Icon,
  title,
  description,
  colorClass,
  delay,
  iconAnimation,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}>
      <Link href={href} className="block">
        <div className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-gold/10">
          {/* Top colored section with the animated icon */}
          <div
            className={`relative flex items-center justify-center p-12 transition-colors duration-300 ${colorClass}`}>
            <motion.div
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              // The animation is applied on group-hover
              animate={iconAnimation}>
              <Icon className="h-16 w-16 text-white" />
            </motion.div>
            {/* A subtle glow effect for the top panel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          </div>

          {/* Bottom section for text content */}
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white">{title}</h3>

            {/* The description now reveals on hover */}
            <div className="h-12 overflow-hidden transition-all duration-300">
              <p className="text-slate opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {description}
              </p>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-gold">
              <span>Continue</span>
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function LoginGatewayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Welcome to the Portal
        </h1>
        <p className="mt-4 text-lg text-slate">
          Please select your role to continue.
        </p>
      </motion.div>

      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div
          // This wrapper provides the hover state to the card component
          whileHover="hover"
          className="w-full">
          <LoginRoleCard
            href="/portal/login/student"
            Icon={GraduationCap}
            title="Student Portal"
            description="Access courses, assignments, and progress."
            colorClass="bg-slate-800/30"
            delay={0.2}
            iconAnimation={{
              // Define the animation states for the icon
              rest: { rotate: 0, scale: 1 },
              hover: { rotate: [-5, 5, -3, 3, 0], scale: 1.1 },
            }}
          />
        </motion.div>

        <motion.div whileHover="hover" className="w-full">
          <LoginRoleCard
            href="/portal/login/teacher"
            Icon={Presentation}
            title="Teacher Portal"
            description="Manage courses, students, and announcements."
            colorClass="bg-brand-gold/10"
            delay={0.4}
            iconAnimation={{
              rest: { y: 0 },
              hover: { y: [-4, 4, 0] },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
