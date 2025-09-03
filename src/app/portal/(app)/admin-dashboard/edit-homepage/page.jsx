"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/app/(site)/components/HeroSection"; // IMPORTANT: Adjust this import path to where your HeroSection.jsx is
import { Layout, Save, RotateCcw } from "lucide-react";

// Helper component for form fields
const FormField = ({ label, name, value, onChange, component = "input" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate mb-1">
      {label}
    </label>
    {component === "textarea" ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
    ) : (
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-2 text-light-slate focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
      />
    )}
  </div>
);

export default function EditHomepagePage() {
  const initialContent = {
    headline: "Excellence. Achievement. Success.",
    paragraph:
      "Welcome to Brightspark, where we forge the future's brightest minds. Your journey to the top begins here.",
    button1Text: "Explore Academics",
    button1Link: "/courses",
    button2Text: "Book a Consultation",
    button2Link: "/contact",
  };

  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSaveChanges = () => {
    console.log("Saving content:", content);
    setIsDirty(false);
    // Here you would typically make an API call to save the data
  };

  const handleReset = () => {
    setContent(initialContent);
    setIsDirty(false);
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-2">
        Edit Homepage
      </h1>
      <p className="text-lg text-slate mb-8">
        Modify the content of the public-facing homepage. Changes are reflected
        in the live preview.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Editing Form */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-slate-900/20 p-6 backdrop-blur-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <Layout className="h-6 w-6 text-brand-gold" />
            <h3 className="text-lg font-semibold text-light-slate">
              Hero Section Content
            </h3>
          </div>
          <div className="space-y-4">
            <FormField
              label="Headline"
              name="headline"
              value={content.headline}
              onChange={handleInputChange}
            />
            <FormField
              label="Paragraph"
              name="paragraph"
              value={content.paragraph}
              onChange={handleInputChange}
              component="textarea"
            />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
              <FormField
                label="Primary Button Text"
                name="button1Text"
                value={content.button1Text}
                onChange={handleInputChange}
              />
              <FormField
                label="Primary Button Link"
                name="button1Link"
                value={content.button1Link}
                onChange={handleInputChange}
              />
              <FormField
                label="Secondary Button Text"
                name="button2Text"
                value={content.button2Text}
                onChange={handleInputChange}
              />
              <FormField
                label="Secondary Button Link"
                name="button2Link"
                value={content.button2Link}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end gap-2">
            <button
              onClick={handleReset}
              disabled={!isDirty}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50">
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={!isDirty}
              className="flex items-center gap-2 rounded-md bg-brand-gold px-6 py-2 text-sm font-bold text-dark-navy transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-slate-600">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </motion.div>

        {/* Right Column: Live Preview */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-brand-gold mb-4 text-center">
            Live Preview
          </h3>
          <div className="aspect-video w-full rounded-2xl border border-white/10 bg-dark-navy overflow-hidden transform scale-[0.85] origin-top">
            <HeroSection content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
