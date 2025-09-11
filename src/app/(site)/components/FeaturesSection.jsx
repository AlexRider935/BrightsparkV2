"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BrainCircuit, Award, TrendingUp } from "lucide-react";

// Data remains the same
const features = [
  {
    id: 1,
    Icon: Users,
    title: "Personalized Attention",
    description:
      "Our industry-leading 1:15 teacher-student ratio ensures every student receives the individual guidance needed to master complex topics.",
    visual: { type: "gauge", value: 95, label: "Individual Focus" },
  },
  {
    id: 2,
    Icon: BrainCircuit,
    title: "Concept-Driven Learning",
    description:
      "We build a web of knowledge, connecting core concepts to ensure deep, lasting understanding, not just surface-level memorization.",
    visual: { type: "network" },
  },
  {
    id: 3,
    Icon: Award,
    title: "Experienced Faculty",
    description:
      "Our educators are subject matter experts with an average of over 7 years of experience in competitive exam coaching.",
    visual: { type: "stat", value: "7+", label: "Years of Experience" },
  },
  {
    id: 4,
    Icon: TrendingUp,
    title: "Data-Driven Results",
    description:
      "Transparent progress tracking and regular doubt-solving sessions lead to measurable and consistent academic growth.",
    visual: {
      type: "bars",
      values: [40, 65, 80, 95],
      label: "Measurable Student Growth",
    },
  },
];

// The visual rendering component, with the 'network' case fixed
const FeatureVisual = ({ visual }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  switch (visual.type) {
    case "gauge":
      const circumference = 2 * Math.PI * 45;
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center h-full text-center">
          <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference * (1 - visual.value / 100),
              }}
              transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
            />
          </svg>
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="absolute flex flex-col">
            <span className="text-4xl font-bold text-white">1:15</span>
            <span className="text-sm text-slate">Ratio</span>
          </motion.div>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="mt-4 font-semibold text-base text-white">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    case "bars":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center h-full text-center">
          <div className="flex items-end h-36 gap-4">
            {visual.values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${v}%`, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.2 + i * 0.1,
                }}
                className="w-10 rounded-t-md bg-brand-gold"
                style={{
                  background: "linear-gradient(to top, #ca8a04, #FBBF24)",
                }}
              />
            ))}
          </div>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="mt-4 font-semibold text-base text-white">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    case "stat":
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center h-full text-center">
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-8xl font-bold text-white">
            {visual.value}
          </motion.p>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="mt-1 font-semibold text-base text-slate">
            {visual.label}
          </motion.p>
        </motion.div>
      );
    // --- THIS IS THE CORRECTED CODE ---
    case "network":
      const nodes = [
        { x: 50, y: 50 },
        { x: 20, y: 30 },
        { x: 80, y: 25 },
        { x: 25, y: 75 },
        { x: 75, y: 70 },
      ];
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex items-center justify-center h-full w-full">
          <svg
            viewBox="0 0 100 100"
            className="absolute w-full h-full"
            style={{ overflow: "visible" }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Lines */}
            <g opacity="0.4">
              {nodes.slice(1).map((node, i) => (
                <motion.line
                  key={`line-${i}`}
                  x1={nodes[0].x}
                  y1={nodes[0].y}
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(251, 191, 36, 0.7)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                />
              ))}
            </g>
            {/* Dots (as circles inside the SVG) */}
            {nodes.map((node, i) => (
              <motion.circle
                key={`circle-${i}`}
                cx={node.x}
                cy={node.y}
                r={i === 0 ? "3" : "2.5"}
                fill="#FBBF24"
                filter={i === 0 ? "url(#glow)" : "none"}
                variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1 + i * 0.05,
                }}
              />
            ))}
          </svg>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="absolute bottom-10 font-semibold text-base text-white">
            Connected Concepts
          </motion.p>
        </motion.div>
      );
    default:
      return null;
  }
};

// The main component remains structurally the same
export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="relative mt-24 py-24">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/image2.png')" }}
      />
      <div className="absolute inset-0 z-10 backdrop-blur-sm" />

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
            Our methodology is built on core principles that create a powerful
            ecosystem for academic excellence.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col gap-4">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                onMouseEnter={() => setActiveFeature(feature)}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
                className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                  activeFeature.id === feature.id
                    ? "border-brand-gold/50 bg-white/10 shadow-2xl shadow-brand-gold/10"
                    : "border-slate-700 bg-white/5 hover:bg-white/10"
                }`}>
                <div className="flex items-center gap-5">
                  <div
                    className={`flex-shrink-0 rounded-full p-3 transition-colors duration-300 ${
                      activeFeature.id === feature.id
                        ? "bg-brand-gold/10"
                        : "bg-slate-700/50"
                    }`}>
                    <feature.Icon
                      className={`h-6 w-6 transition-colors duration-300 ${
                        activeFeature.id === feature.id
                          ? "text-brand-gold"
                          : "text-slate-300"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {activeFeature.id === feature.id && (
                  <motion.div
                    layoutId="active-feature-highlight"
                    className="absolute inset-0 rounded-xl ring-2 ring-inset ring-brand-gold pointer-events-none"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-96 w-full rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md lg:h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 p-4">
                <FeatureVisual visual={activeFeature.visual} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
