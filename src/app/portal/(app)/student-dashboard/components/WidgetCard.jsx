"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const WidgetCard = ({ title, Icon, route, children }) => {
  const router = useRouter();

  const handleClick = () => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg overflow-hidden group flex flex-col"
      // The whileHover prop has been removed from this element
      transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-dark-navy p-2 rounded-lg border border-white/10">
          <Icon className="h-6 w-6 text-brand-gold" />
        </div>
        <h3 className="text-lg font-semibold text-light-slate">{title}</h3>
      </div>
      <div className="text-slate text-sm flex-grow pb-6">{children}</div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-slate text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
        View All <ArrowRight size={14} />
      </div>
    </motion.div>
  );
};

export default WidgetCard;
