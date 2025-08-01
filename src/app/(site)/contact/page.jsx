"use client";

import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

// A reusable component for contact info items
const ContactInfoItem = ({ icon, title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-4"
    >
        <div className="mt-1 rounded-full bg-brand-gold/10 p-3 ring-1 ring-inset ring-brand-gold/20">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <div className="mt-1 text-slate">{children}</div>
        </div>
    </motion.div>
);

export default function ContactPage() {
    return (
        <div className="pt-24"> {/* Added padding-top to account for the fixed navbar */}
            <section className="relative py-24">
                <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/image2.png')" }} />
                <div className="absolute inset-0 z-10 " />
                
                <div className="container relative z-20 mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Get in Touch</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
                            We're here to answer your questions. Reach out to us and we'll respond as soon as we can.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
                        
                        {/* --- Left Column: Contact Info & Map --- */}
                        <div className="space-y-8">
                            <ContactInfoItem icon={<FiMail className="h-6 w-6 text-brand-gold" />} title="Email Us">
                                <a href="mailto:contact@brightspark.edu" className="transition-colors hover:text-brand-gold">
                                    contact@brightspark.edu
                                </a>
                                <p className="text-sm">We aim to reply within 24 hours.</p>
                            </ContactInfoItem>

                            <ContactInfoItem icon={<FiPhone className="h-6 w-6 text-brand-gold" />} title="Call Us">
                                <a href="tel:+919876543210" className="transition-colors hover:text-brand-gold">
                                    +91 987 654 3210
                                </a>
                                <p className="text-sm">Mon - Sat, 4:00 PM - 7:30 PM IST</p>
                            </ContactInfoItem>

                            <ContactInfoItem icon={<FiMapPin className="h-6 w-6 text-brand-gold" />} title="Visit Us">
                                <p>Jagatpura, Jaipur, Rajasthan</p>
                                <p className="text-sm">India</p>
                            </ContactInfoItem>
                            
                            {/* Embedded Google Map */}
                            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56959.08292429676!2d75.811945!3d26.841122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db7135c7566cd%3A0xe79950b688d6a883!2sJagatpura%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1690901456789!5m2!1sen!2sin"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {/* --- Right Column: Contact Form --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg"
                        >
                            <form action="#" className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate">Full Name</label>
                                    <input type="text" name="name" id="name" required className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate">Email</label>
                                    <input type="email" name="email" id="email" required className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate">Message</label>
                                    <textarea name="message" id="message" rows="4" required className="block w-full rounded-lg border-0 bg-slate/20 px-4 py-3 text-white placeholder-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/70"></textarea>
                                </div>
                                <button type="submit" className="w-full rounded-lg bg-brand-gold py-3 font-bold text-dark-navy transition-transform duration-300 hover:scale-105">
                                    Send Message
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}