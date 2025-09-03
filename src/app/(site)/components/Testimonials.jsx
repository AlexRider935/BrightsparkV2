"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    quote:
      "Ankit is amazing! He helps my child study and understand things better. His teaching is like magic!",
    name: "Brijlata Sharma",
    title: "Govt. Nurse",
    image: "/peeps/brijlata.jpg",
    stars: 5,
  },
  {
    quote:
      "I really like Ankit. He makes learning fun and my child enjoys studying with him.",
    name: "Sarita Sharma",
    title: "Housewife",
    image: "/peeps/sarita.jpg",
    stars: 4,
  },
  {
    quote:
      "Ankit plans lessons so well that my child stays focused and enjoys learning from him. He is a really good teacher.",
    name: "Dharmendra Kumar",
    title: "Mitsubishi Motors",
    image: "/peeps/dharmender.jpg",
    stars: 5,
  },
  {
    quote:
      "Ankit's tutoring is personalized. He listens to my child and encourages questions. It's nice to have that one-on-one attention.",
    name: "Harinder Kumar Yadav",
    title: "ex RWS President",
    image: "/peeps/Harinder.jpeg",
    stars: 4,
  },
  {
    quote:
      "Ankit checks my child's work and gives feedback to help them improve. It's helpful to know what's good and what can be better.",
    name: "Santosh Kumar Singh",
    title: "General Manager",
    image: "/peeps/santosh.jpeg",
    stars: 5,
  },
  {
    quote:
      "I want to thank Ankit for his help. He not only teaches but also guides my child for a better future.",
    name: "Surender Singh",
    title: "RWS Head Krish City",
    image: "/peeps/surender.png",
    stars: 4,
  },
  {
    quote:
      "Ankit goes beyond textbooks. He discusses interesting things that make my child think and learn more.",
    name: "Mahender Rajpoot",
    title: "Honda Motors",
    image: "/peeps/surender.png",
    stars: 5,
  },
  {
    quote:
      "Ankit makes studying convenient. He offers flexible timings and is always available to assist my child.",
    name: "Yashpal Kamboj",
    title: "Honda Motors",
    image: "/peeps/yashpal.jpg",
    stars: 4,
  },
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/20 p-6 backdrop-blur-lg shadow-lg h-full">
      <FaQuoteLeft className="absolute -top-2 -left-2 text-6xl text-white/5" />
      <div className="mb-4 flex items-center gap-1">
        {[...Array(testimonial.stars)].map((_, i) => (
          <FaStar key={i} className="text-brand-gold" />
        ))}
      </div>
      <p className="z-10 text-base font-light italic text-slate">
        "{testimonial.quote}"
      </p>
      <div className="mt-4 flex items-center gap-4 pt-4">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-sm text-slate">{testimonial.title}</p>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const AUTOPLAY_INTERVAL = 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <section className="relative mt-24 py-24">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/image2.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-dark-navy/5" />

      <div className="container relative z-20 mx-auto px-6">
        {/* NEW: Two-column grid for the entire section */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* --- Left Column: Section Title --- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] sm:text-5xl">
              Voices of Success
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] lg:mx-0">
              Hear from the parents who have witnessed the Brightspark
              transformation firsthand.
            </p>
          </motion.div>

          {/* --- Right Column: The Testimonial Reel --- */}
          <div className="relative mt-12 lg:mt-0">
            <div className="mb-8 flex justify-center space-x-[-16px] lg:justify-start">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  className="relative rounded-full"
                  animate={
                    i === index
                      ? { scale: 1.1, zIndex: 10 }
                      : { scale: 0.9, zIndex: 1 }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={56}
                    height={56}
                    className={`h-14 w-14 rounded-full object-cover ring-2 ring-dark-navy/50 transition-all duration-300 ${
                      i === index
                        ? "grayscale-0 opacity-100"
                        : "grayscale opacity-50"
                    }`}
                  />
                  {i === index && (
                    <motion.div
                      layoutId="highlight-ring"
                      className="absolute inset-0 rounded-full ring-2 ring-brand-gold"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="relative h-64">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0">
                  <TestimonialCard testimonial={testimonials[index]} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex justify-center gap-2 lg:justify-start">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="h-1.5 w-full max-w-[60px] cursor-pointer rounded-full bg-slate-700/50">
                  {i === index && (
                    <motion.div
                      className="h-full rounded-full bg-brand-gold"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: AUTOPLAY_INTERVAL / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
