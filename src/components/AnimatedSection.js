"use client";

import { motion } from "framer-motion";

export default function AnimatedSection({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay }}
            viewport={{ once: true }}
        >
            {children}
        </motion.div>
    );
}