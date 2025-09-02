"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  KeyRound,
  ShieldCheck,
  Users,
  BookMarked,
  LayoutTemplate,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import Image from "next/image";

// Reusable component for floating-label inputs
const FloatingLabelInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon
          className={`transition-colors duration-300 ${
            isFocused || value ? "text-brand-gold" : "text-slate"
          }`}
          size={20}
        />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=" "
        required
        className="peer block w-full appearance-none rounded-lg border border-slate/30 bg-dark-navy/60 p-4 pl-12 text-light-slate backdrop-blur-sm transition-colors duration-300 focus:border-brand-gold focus:outline-none focus:ring-0"
        {...props}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-12 top-4 origin-[0] -translate-y-7 scale-75 transform text-sm text-slate duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-brand-gold`}>
        {label}
      </label>
    </div>
  );
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password, "admin");
      router.push("/portal/admin-dashboard");
    } catch (err) {
      setError("Invalid credentials or insufficient permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const adminFeatures = [
    { Icon: Users, text: "Manage Students & Faculty" },
    { Icon: BookMarked, text: "Publish Results & Assignments" },
    { Icon: LayoutTemplate, text: "Update Website Content" },
  ];

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Panel: Branding & Features */}
      <motion.div
        className="relative hidden flex-col justify-center bg-dark-navy p-12 text-left lg:flex lg:w-1/2"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <div className="z-10 w-full max-w-md mx-auto">
          <Image
            src="/logo.svg"
            alt="Brightspark Institute Logo"
            width={60}
            height={60}
            className="mb-6"
          />
          <h1 className="text-4xl font-bold text-light-slate">
            Admin Control Panel
          </h1>
          <p className="mt-4 text-lg text-slate">
            The central hub for managing all institute operations.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
            {adminFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.Icon className="h-5 w-5 text-brand-gold" />
                <span className="text-light-slate">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(204, 214, 246, 0.05) 2%, transparent 0%)",
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      {/* Right Panel: Advanced Login Form */}
      <div className="flex w-full items-center justify-center bg-dark-navy/95 p-6 lg:w-1/2 lg:p-12">
        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <div className="absolute -inset-4 z-0 opacity-20">
            <motion.div
              className="absolute -bottom-10 -right-10 h-40 w-72 rounded-full bg-brand-gold blur-3xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -top-10 -left-10 h-52 w-52 rounded-full bg-light-slate blur-3xl"
              animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative z-10 space-y-6 rounded-2xl border border-white/10 bg-slate-900/20 p-8 shadow-2xl backdrop-blur-lg">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-light-slate">
                Administrator Access
              </h2>
            </div>
            <div className="text-center text-xs text-slate border-t border-b border-white/10 py-3">
              <p>Tuesday, September 2, 2025, 3:45 PM</p>
              <p>IP Address: 115.241.224.18 (Udaipur, IN)</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <FloatingLabelInput
                id="email"
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />
              <FloatingLabelInput
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
              />
              <FloatingLabelInput
                id="otp"
                label="6-Digit Authenticator Code"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                icon={KeyRound}
                maxLength="6"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-center text-sm text-red-400">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold p-4 text-lg font-bold text-dark-navy transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-brand-gold/20 disabled:cursor-not-allowed disabled:bg-slate-600"
                whileTap={{ scale: 0.98 }}>
                {isLoading ? (
                  <motion.div
                    className="h-6 w-6 rounded-full border-2 border-dark-navy border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <>
                    <LogIn size={22} />
                    <span>Secure Sign In</span>
                  </>
                )}
              </motion.button>
            </form>
            <div className="flex items-center gap-2 text-xs text-slate/70 pt-4 border-t border-white/10">
              <ShieldCheck size={28} className="shrink-0" />
              <p>
                For security purposes, all administrative actions are logged.
                Ensure you are on the official `brightspark.space` domain.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
