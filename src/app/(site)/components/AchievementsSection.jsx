"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
  animate,
} from "framer-motion";
import { FiAward, FiUsers, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";

// --- Data for the section ---
const stats = [
  { value: 7, label: "Years of Excellence", Icon: FiAward },
  { value: 500, label: "Successful Students", Icon: FiUsers },
  { value: 95, label: "Improvement Rate", Icon: FiTrendingUp, suffix: "%" },
  { value: 100, label: "Board Results", Icon: FiCheckCircle, suffix: "%" },
];

const achievements = [
  {
    id: "sainik",
    title: "Sainik School Selections",
    description:
      "Promoting academic excellence, character development, and leadership skills through a balanced blend of academics, fitness training, and a disciplined environment.",
    image: "/achievements/sainik.png",
    features: [
      "Character Development",
      "Leadership Skills",
      "Disciplined Environment",
      "Fitness Training",
    ],
  },
  {
    id: "inspire",
    title: "Science Inspire Awards",
    description:
      "Our students have excelled in the esteemed Manak Science Inspire Awards. Their innovative projects and scientific brilliance have earned them well-deserved recognition.",
    image: "/achievements/inspire.png",
    features: [
      "Innovative Projects",
      "Scientific Brilliance",
      "National Recognition",
      "Future Leaders",
    ],
  },
  {
    id: "boards",
    title: "100% Board Results",
    description:
      "Our students are true champions! Their determination and focus paid off with excellent results in the challenging board examinations. We are incredibly proud of their success.",
    image: "/achievements/boards.png",
    features: [
      "Proven Study Habits",
      "Strategic Preparation",
      "Consistent High Scores",
      "Comprehensive Support",
    ],
  },
];

const StatItem = ({ stat }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 20 },
      });
    }
  }, [isInView, controls]);

  const AnimatedNumber = ({ value }) => {
    const [number, setNumber] = useState(0);
    useEffect(() => {
      if (isInView) {
        const animationControls = animate(0, value, {
          duration: 2,
          ease: "easeOut",
          onUpdate(latest) {
            setNumber(Math.round(latest));
          },
        });
        return () => animationControls.stop();
      }
    }, [isInView, value]);
    return <span>{number}</span>;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      className="text-center">
      <stat.Icon className="mx-auto h-10 w-10 text-brand-gold mb-2" />
      <p className="text-4xl font-bold text-white">
        <AnimatedNumber value={stat.value} />
        {stat.suffix}
      </p>
      <p className="text-sm text-slate">{stat.label}</p>
    </motion.div>
  );
};

export default function AchievementsSection() {
  const [activeTab, setActiveTab] = useState(achievements[0].id);
  const activeAchievement = achievements.find((a) => a.id === activeTab);

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
          className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            A Legacy of Excellence
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate">
            Our commitment to quality education is reflected in the consistent
            success of our students.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-20">
          <div className="flex justify-center border-b border-slate-700">
            {achievements.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-1/3 py-3 text-sm font-medium transition-colors sm:text-base ${
                  activeTab === tab.id
                    ? "text-brand-gold"
                    : "text-slate hover:text-white"
                }`}>
                {tab.title}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-achievement-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              <Image
                src={activeAchievement.image}
                alt={activeAchievement.title}
                width={500}
                height={400}
                className="rounded-lg object-cover shadow-2xl"
              />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold text-white">
                  {activeAchievement.title}
                </h3>
                <p className="mt-2 text-slate">
                  {activeAchievement.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {activeAchievement.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <FiCheckCircle className="h-5 w-5 flex-shrink-0 text-brand-gold" />
                      <span className="text-slate">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-l-2 border-brand-gold/30 pl-4">
                  <p className="italic text-slate">
                    "Our mission is not just to teach, but to ignite a lifelong
                    passion for learning."
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    - Ankit Mahala, Founder
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
