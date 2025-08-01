"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BrainCircuit, Award, TrendingUp } from "lucide-react";

// --- ADDED: Data now includes a 'visual' property for the dashboard ---
const features = [
  {
    id: 1,
    Icon: Users,
    title: "Personalized Attention",
    description:
      "With a 1:12 teacher-student ratio, every student receives the individual focus they need to thrive and excel.",
    visual: { type: "pie", value: 1 / 12, label: "1:12 Ratio" },
  },
  {
    id: 2,
    Icon: BrainCircuit,
    title: "Concept-Driven Learning",
    description:
      "We focus on building deep, foundational understanding from the ground up, not just memorization for exams.",
    visual: { type: "network" },
  },
  {
    id: 3,
    Icon: Award,
    title: "Experienced Faculty",
    description:
      "Our team of dedicated and passionate educators brings years of experience and subject mastery to the classroom.",
    visual: { type: "stat", value: "12+", label: "Years Experience" },
  },
  {
    id: 4,
    Icon: TrendingUp,
    title: "Proven Results",
    description:
      "Through regular doubt-solving sessions and transparent progress tracking, we ensure consistent improvement and success.",
    visual: { type: "bars", values: [40, 65, 80, 95], label: "Student Growth" },
  },
];

// --- NEW: A dedicated component to render the correct animated visual ---
const FeatureVisual = ({ visual }) => {
  const animationProps = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
    exit: { opacity: 0 },
  };

  switch (visual.type) {
    case "pie":
      return (
        <motion.div
          {...animationProps}
          className="flex flex-col items-center justify-center h-full text-center">
          <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--color-brand-gold)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 45}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 45 * (1 - visual.value),
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="mt-4 font-bold text-lg text-white">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    case "bars":
      return (
        <motion.div
          {...animationProps}
          className="flex flex-col items-center justify-center h-full text-center">
          <div className="flex items-end h-32 gap-4">
            {visual.values.map((v, i) => (
              <motion.div
                key={i}
                custom={v}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${v}%`, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: 0.2 + i * 0.1,
                }}
                className="w-8 rounded-t-sm bg-brand-gold"
              />
            ))}
          </div>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="mt-4 font-bold text-lg text-white">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    case "stat":
      return (
        <motion.div
          {...animationProps}
          className="flex flex-col items-center justify-center h-full text-center">
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-7xl font-bold text-white">
            {visual.value}
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-2 font-bold text-lg text-slate">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    case "network":
      return (
        <motion.div
          {...animationProps}
          className="relative flex items-center justify-center h-full w-full">
          {/* Simplified network visualization */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="absolute h-20 w-20 rounded-full border-2 border-brand-gold/50"
          />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="absolute h-40 w-40 rounded-full border border-brand-gold/30"
          />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            className="absolute h-56 w-56 rounded-full border border-brand-gold/20"
          />
        </motion.div>
      );
    default:
      return null;
  }
};

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="relative mt-24 py-24">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/image2.png')" }}
      />
      <div className="absolute inset-0 z-10  backdrop-blur-sm" />

      <div className="container relative z-20 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            The Brightspark Advantage
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate">
            Discover the core principles that set our students on a path to
            lifelong success.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* --- Left Column: Interactive Feature List --- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                onMouseEnter={() => setActiveFeature(feature)}
                className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                  activeFeature.id === feature.id
                    ? "border-brand-gold/50 bg-white/10"
                    : "border-slate-700 bg-white/5 hover:bg-white/10"
                }`}>
                <div className="flex items-center gap-4">
                  <feature.Icon
                    className={`h-8 w-8 transition-colors duration-300 ${
                      activeFeature.id === feature.id
                        ? "text-brand-gold"
                        : "text-slate-300"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate">{feature.description}</p>
                  </div>
                </div>
                {activeFeature.id === feature.id && (
                  <motion.div
                    layoutId="active-feature-highlight"
                    className="absolute inset-0 rounded-xl ring-2 ring-inset ring-brand-gold"
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* --- Right Column: The NEW Animated Data Dashboard --- */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-80 w-full rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md lg:h-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0">
                <FeatureVisual visual={activeFeature.visual} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
