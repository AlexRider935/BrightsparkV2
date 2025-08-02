"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { FaLinkedin, FaTwitter } from "react-icons/fa";

// Data for the "By the Numbers" section
const stats = [
  { value: 12, label: "Years of Excellence", Icon: FiAward },
  { value: 500, label: "Successful Alumni", Icon: FiUsers },
  { value: 95, label: "Improvement Rate", Icon: FiTrendingUp, suffix: "%" },
  { value: 100, label: "Board Results", Icon: FiCheckCircle, suffix: "%" },
];

// --- NEW: Data for the Teachers Section ---
const teachers = [
  {
    name: "Mrs. Sharma",
    title: "Lead Physics Faculty",
    image: "/team/hero-1.jpg", // Replace with actual images
    bio: "With over 15 years of experience, Mrs. Sharma makes complex physics concepts intuitive and engaging.",
  },
  {
    name: "Mr. Gupta",
    title: "Head of Chemistry",
    image: "/team/hero-2.jpg",
    bio: "Mr. Gupta's passion for chemistry is contagious, inspiring students to explore the molecular world.",
  },
  {
    name: "Ms. Verma",
    title: "Mathematics Specialist",
    image: "/team/hero-3.jpg",
    bio: "An expert in competitive math, Ms. Verma equips students with the skills to excel in any exam.",
  },
];

// --- NEW: Data for the Unsung Heroes Section ---
const unsungHeroes = [
  {
    name: "Mitali Amit Patil",
    title: "Design Expert",
    image: "/team/hero-1.jpg",
  },
  { name: "Apoorva Sharma", title: "Tech & Design", image: "/team/hero-2.jpg" },
  {
    name: "Rajat Mahala",
    title: "Student Counselor",
    image: "/team/hero-3.jpg",
  },
];

const StatItem = ({ stat }) => (
  <div className="text-center">
    <stat.Icon className="mx-auto h-10 w-10 text-brand-gold mb-2" />
    <p className="text-4xl font-bold text-white">
      {stat.value}
      {stat.suffix}
    </p>
    <p className="text-sm text-slate">{stat.label}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className=" text-light-slate">
      {/* --- Section 1: Page Header --- */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/image2.png')", opacity: 0.1 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 px-6">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            More Than an Institute.
            <br />
            <span className="text-brand-gold">
              A Foundation for the Future.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate">
            Brightspark was founded on a simple principle: true learning is
            about igniting curiosity, not just memorizing facts for an exam.
          </p>
        </motion.div>
      </section>

      {/* --- Section 2: Our Philosophy --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Our Mission: Concept-Driven Education
              </h2>
              <p className="mt-4 text-slate">
                We believe in building a deep, conceptual understanding from the
                ground up. Our approach focuses on the 'why' behind every
                subject, creating a strong foundation that empowers students to
                tackle any challenge with confidence.
              </p>
              <p className="mt-4 text-slate">
                With small batch sizes and a supportive environment, we ensure
                every student gets the personalized attention they need to
                unlock their full potential.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-black/20 p-8 backdrop-blur-lg">
              <h3 className="text-xl font-semibold text-white">
                Core Principles
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-6 w-6 flex-shrink-0 text-brand-gold" />
                  <span className="text-slate">
                    Focus on fundamental understanding over memorization.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-6 w-6 flex-shrink-0 text-brand-gold" />
                  <span className="text-slate">
                    Maintain a 1:12 teacher-student ratio for personalized
                    focus.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-6 w-6 flex-shrink-0 text-brand-gold" />
                  <span className="text-slate">
                    Provide a supportive and encouraging learning environment.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Section 3: By the Numbers --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-8 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
              {stats.map((stat) => (
                <StatItem key={stat.label} stat={stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 4: Meet the Founder --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-96 w-full max-w-md mx-auto">
              <Image
                src="/founder.jpg"
                alt="Ankit Mahala, Founder"
                fill
                className="rounded-2xl object-cover shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Meet Our Founder
              </h2>
              <h3 className="text-xl font-semibold text-brand-gold mt-1">
                Ankit Mahala
              </h3>
              <div className="mt-4 border-l-2 border-brand-gold/30 pl-4">
                <p className="italic text-slate">
                  "Our mission is not just to teach, but to ignite a lifelong
                  passion for learning. We build futures with unwavering
                  integrity and a commitment to excellence."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-slate transition-colors hover:text-brand-gold">
                  <FaLinkedin size={24} />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-slate transition-colors hover:text-brand-gold">
                  <FaTwitter size={24} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- NEW Section 5: Meet Our Teachers --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white">
            Meet Our Expert Teachers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
            The passionate educators dedicated to your child's success.
          </p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.2 }}
            className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <motion.div
                key={teacher.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="group relative h-96 overflow-hidden rounded-2xl">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-brand-gold">{teacher.title}</p>
                  <div className="h-0 overflow-hidden transition-all duration-500 group-hover:h-20 group-hover:mt-2">
                    <p className="text-sm text-slate">{teacher.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- NEW Section 6: Our Unsung Heroes --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Our Unsung Heroes</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
            The dedicated team working behind the scenes to create the best
            learning experience.
          </p>
          <div className="mt-12 flex justify-center -space-x-4">
            {unsungHeroes.map((hero, i) => (
              <motion.div
                key={hero.name}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.15, type: "spring" }}
                className="group relative">
                <Image
                  src={hero.image}
                  alt={hero.name}
                  width={128}
                  height={128}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-dark-navy transition-transform duration-300 group-hover:scale-110 md:h-32 md:w-32"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max rounded-full bg-slate-800 px-3 py-1 text-xs text-white opacity-0 transition-all duration-300 group-hover:bottom-[-2.5rem] group-hover:opacity-100">
                  <p className="font-semibold">{hero.name}</p>
                  <p className="text-slate-400">{hero.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 7: Call to Action --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Join Our Community?
          </h2>
          <p className="mt-4 text-lg text-slate">
            Let's start your journey to academic excellence together.
          </p>
          <Link
            href="/contact"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-gold px-8 py-3 font-bold text-dark-navy shadow-lg shadow-brand-gold/20 transition-transform duration-300 hover:scale-105">
            <span>Contact Us Today</span>
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
