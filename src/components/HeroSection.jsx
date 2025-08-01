"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

// --- AnimatedHeadline sub-component (Stamping effect) ---
const AnimatedHeadline = () => {
  const headline = "Excellence. Achievement. Success.";
  const words = headline.split(" ");
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.25 } },
  };
  const wordVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-white to-light-slate bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent sm:text-5xl md:text-7xl">
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block">
          {word}&nbsp;
        </motion.span>
      ))}
    </motion.h1>
  );
};

// --- Background component with adjusted icon intensity ---
const BlueprintBackground = () => {
  const iconVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: { duration: 8, ease: "linear", repeat: Infinity },
    },
  };
  const icons = [
    {
      src: "/HeroSectionIcons/atom.png",
      className: "absolute top-[17%] left-[5%] h-16 w-16",
      delay: 0,
    },
    {
      src: "/HeroSectionIcons/ecosystems.png",
      className: "absolute bottom-[10%] right-[5%] h-20 w-20",
      delay: 2,
    },
    {
      src: "/HeroSectionIcons/innovation.png",
      className: "absolute bottom-[10%] left-[40%] h-24 w-24",
      delay: 3,
    },
  ];

  return (
    // Adjusted intensity by changing color opacity from /5 to /10 and removing parent opacity
    <div className="absolute inset-0 z-0 text-brand-gold/10">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          variants={iconVariants}
          initial="initial"
          animate="animate"
          transition={{ ...iconVariants.animate.transition, delay: icon.delay }}
          className={icon.className}>
          <Image
            src={icon.src}
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </motion.div>
      ))}
    </div>
  );
};

// --- Visual element in the right column ---
const IconNebula = () => {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="relative h-[450px] w-[450px]">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-32"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { delay: 1.5, duration: 0.5 },
          }}>
          <Image
            src="/HeroSectionIcons/atom.png"
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-28 w-28"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { delay: 1.7, duration: 0.5 },
          }}>
          <Image
            src="/HeroSectionIcons/innovation.png"
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </motion.div>
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-36 w-36"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { delay: 1.9, duration: 0.5 },
          }}>
          <Image
            src="/HeroSectionIcons/ecosystems.png"
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </motion.div>
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { delay: 2.1, duration: 0.5 },
          }}>
          <Image
            src="/HeroSectionIcons/medical-research.png"
            alt=""
            fill
            className="object-contain brightness-0 invert"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- Main Hero Section Component ---
export default function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden">
      <BlueprintBackground />
      <div className="absolute inset-0 z-10 bg-dark-navy [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>

      <div className="container relative z-20 mx-auto grid h-full grid-cols-1 items-center px-6 md:grid-cols-2">
        {/* Left Column: Text Content */}
        <div className="text-center md:text-left">
          <AnimatedHeadline />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mx-auto mt-6 max-w-xl text-lg text-slate/80 md:mx-0">
            Welcome to Brightspark, where we forge the future's brightest minds.
            Your journey to the top begins here.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4 md:justify-start">
            <Link
              href="/courses"
              className="transform rounded-full bg-brand-gold px-8 py-3 font-bold text-dark-navy shadow-lg shadow-brand-gold/20 transition-transform duration-300 hover:scale-105">
              Explore Academics
            </Link>
            <Link
              href="/contact"
              className="transform rounded-full border border-slate/30 bg-slate/10 px-8 py-3 font-bold text-light-slate shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-slate/20">
              Book a Consultation
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Visual Element (Re-aligned) */}
        <div className="hidden h-full md:flex justify-center items-center">
          <IconNebula />
        </div>
      </div>
    </section>
  );
}
