"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // clean icons

export default function Navbar() {
    const [highlighterStyle, setHighlighterStyle] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const [hoveredHref, setHoveredHref] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navRef = useRef(null);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/courses", label: "Courses" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const navNode = navRef.current;
            if (!navNode) return;
            const activeLink = navNode.querySelector(`a[data-active="true"]`);
            if (activeLink) {
                setHighlighterStyle({
                    left: activeLink.offsetLeft,
                    width: activeLink.offsetWidth,
                    opacity: 1,
                });
            } else {
                setHighlighterStyle((prev) => ({ ...prev, opacity: 0 }));
            }
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    const handleMouseEnter = (e, link) => {
        setHoveredHref(link.href);
        setHighlighterStyle({
            left: e.target.offsetLeft,
            width: e.target.offsetWidth,
            opacity: 1,
        });
    };

    const handleMouseLeave = () => {
        setHoveredHref(null);
        const activeLink = navRef.current?.querySelector(`a[data-active="true"]`);
        if (activeLink) {
            setHighlighterStyle({
                left: activeLink.offsetLeft,
                width: activeLink.offsetWidth,
                opacity: 1,
            });
        } else {
            setHighlighterStyle((prev) => ({ ...prev, opacity: 0 }));
        }
    };

    const podBackground = "bg-dark-navy/80 backdrop-blur-lg";

    return (
        <header className="fixed top-0 w-full z-50 font-sans">
            <div className="container mx-auto flex h-24 items-center justify-between px-6">
                {/* Logo (unchanged) */}
                <div
                    className={`h-16 aspect-[260/64] flex items-center justify-center rounded-full shadow-lg ${podBackground}`}
                >
                    <Link href="/" aria-label="Back to Homepage">
                        <Image
                            src="/logo.svg"
                            alt="Brightspark Institute Logo"
                            width={240}
                            height={48}
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Nav (unchanged) */}
                <div
                    className={`hidden items-center gap-4 rounded-full p-3 shadow-lg md:flex ${podBackground}`}
                >
                    <nav
                        ref={navRef}
                        onMouseLeave={handleMouseLeave}
                        className="relative flex items-center"
                    >
                        <motion.span
                            animate={highlighterStyle}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute z-0 h-10 rounded-full bg-brand-gold"
                        />
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            const isHovered = hoveredHref === link.href;
                            const isHighlighted = (isActive && !hoveredHref) || isHovered;
                            const textColorClass = isHighlighted
                                ? "text-dark-navy"
                                : "text-light-slate/80";

                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onMouseEnter={(e) => handleMouseEnter(e, link)}
                                    data-active={isActive}
                                    className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 ${textColorClass}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <span className="h-6 w-px bg-slate/30" />
                    <Link
                        href="/portal/login"
                        className="rounded-full bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy transition-transform duration-300 hover:scale-105"
                    >
                        Student Portal
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg bg-dark-navy/80 backdrop-blur-lg shadow-lg text-light-slate"
                        aria-label="Toggle Menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-dark-navy/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8"
                    >
                        {navLinks.map((link, i) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            return (
                                <motion.div
                                    key={link.label}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`text-2xl font-bold ${isActive ? "text-brand-gold" : "text-light-slate"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            );
                        })}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Link
                                href="/portal/login"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-full bg-brand-gold px-8 py-3 text-lg font-bold text-dark-navy shadow-lg hover:scale-105 transition-transform"
                            >
                                Student Portal
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}