"use client";

import { useState, useEffect } from "react"; // Added useState and useEffect for the clock
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FiArrowRight, FiArrowUp, FiArrowUpRight } from "react-icons/fi"; // Added FiArrowUpRight for hover
import { Award, Users, Star, Layers, Ratio } from "lucide-react";

// --- Sub-component for Key Metrics ---
const MetricItem = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-2">
      {icon}
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
    <p className="text-xs text-slate tracking-wider">{label}</p>
  </div>
);

export default function Footer() {
  const [time, setTime] = useState(""); // CHANGE 1: State for the clock
  const year = new Date().getFullYear();

  // CHANGE 2: useEffect hook to create the live clock
  useEffect(() => {
    const updateTime = () => {
      const newTime = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(new Date());
      setTime(newTime);
    };
    updateTime();
    const timerId = setInterval(updateTime, 60000); // Updates every minute
    return () => clearInterval(timerId);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const linkSections = {
    Navigate: [
      { href: "/about", label: "About Us" },
      { href: "/courses", label: "Our Courses" },
      { href: "/blog", label: "Insights" },
      { href: "/contact", label: "Contact" },
    ],
    Resources: [
      { href: "/portal/login", label: "Student Portal" },
      { href: "#", label: "Admission FAQs" },
      { href: "#", label: "Events" },
      { href: "#", label: "Careers" },
    ],
    Legal: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "#", label: "Disclaimers" },
    ],
  };

  return (
    <footer className="mt-20 font-sans text-light-slate bg-gradient-to-t from-dark-navy via-dark-navy/95 to-transparent">
      <div className="container mx-auto px-6 pt-12 pb-6">
        {/* --- Top Section: Compact --- */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ignite Your Potential
            </h2>
            <p className="mt-1 text-sm text-slate">
              Join our community and stay ahead of the curve.
            </p>
          </div>
          <form action="#" className="w-full max-w-sm shrink-0">
            <div className="group relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate/10 py-2.5 pl-4 pr-32 text-white outline-none rounded-full transition-all duration-300 focus:ring-2 focus:ring-brand-gold/50"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full bg-brand-gold px-4 py-1.5 text-sm font-bold text-dark-navy transition-all duration-300 group-hover:bg-yellow-300 hover:scale-105">
                Subscribe <FiArrowRight />
              </button>
            </div>
          </form>
        </div>

        {/* --- Key Metrics Section with Encapsulating Borders --- */}
        <div className="my-8 py-6 border-y border-slate/20">
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            <MetricItem
              icon={<Star className="text-brand-gold" />}
              value="95%"
              label="Improvement Rate"
            />
            <MetricItem
              icon={<Award className="text-brand-gold" />}
              value="12+"
              label="Years of Excellence"
            />
            <MetricItem
              icon={<Users className="text-brand-gold" />}
              value="500+"
              label="Successful Alumni"
            />
            <MetricItem
              icon={<Layers className="text-brand-gold" />}
              value="4"
              label="Core Subjects"
            />
            <MetricItem
              icon={<Ratio className="text-brand-gold" />}
              value="1:12"
              label="Teacher Ratio"
            />
          </div>
        </div>

        {/* --- Sitemap with Right-Aligned Links --- */}
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left lg:w-1/4 ">
            <Link href="/" className="inline-block">
              <Image
                src="/logo1.svg"
                alt="Brightspark Institute Logo"
                width={200}
                height={50}
                className="h-16 w-auto scale-[3.5] ml-16"
              />
            </Link>
            <p className="mt-4 text-xs text-slate mx-auto lg:mx-0">
              A premier coaching institute in Kota, Rajasthan, dedicated to
              fostering academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4 sm:text-left lg:w-3/5">
            {Object.entries(linkSections).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-3 font-semibold tracking-wide text-white">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      {/* CHANGE 3: Link component updated with hover animation */}
                      <Link
                        href={link.href}
                        className="group flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-brand-gold justify-center sm:justify-start">
                        <span>{link.label}</span>
                        <FiArrowUpRight className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="mb-3 font-semibold tracking-wide text-white">
                Connect
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate">Jagatpura, Jaipur, India</p>
                <a
                  href="mailto:contact@brightspark.edu"
                  className="block text-slate transition-colors hover:text-brand-gold">
                  contact@brightspark.edu
                </a>
                <a
                  href="tel:+919876543210"
                  className="block text-slate transition-colors hover:text-brand-gold">
                  +91 987 654 3210
                </a>
                <div className="flex items-center justify-center gap-4 pt-2 sm:justify-start">
                  <a href="#" aria-label="Facebook">
                    <FaFacebook
                      size={18}
                      className="text-slate transition-colors hover:text-brand-gold"
                    />
                  </a>
                  <a href="#" aria-label="Instagram">
                    <FaInstagram
                      size={18}
                      className="text-slate transition-colors hover:text-brand-gold"
                    />
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <FaLinkedin
                      size={18}
                      className="text-slate transition-colors hover:text-brand-gold"
                    />
                  </a>
                  <a href="#" aria-label="Twitter">
                    <FaTwitter
                      size={18}
                      className="text-slate transition-colors hover:text-brand-gold"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHANGE 4: Final bar re-aligned with time display added */}
        <div className="mt-8 flex items-center justify-between border-t border-slate/10 pt-4">
          <p className="text-xs text-slate">
            &copy; {year} Brightspark Institute. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              </div>
              <p className="text-xs font-medium text-slate">
                {time}{" "}
                <span className="hidden sm:inline-block">- Kota, IN</span>
              </p>
            </div>
            <button
              onClick={handleScrollToTop}
              className="flex items-center gap-2 text-xs text-slate transition-colors hover:text-brand-gold"
              aria-label="Back to top">
              Back to Top <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
