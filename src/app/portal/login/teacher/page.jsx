"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// A reusable component for the new floating-label inputs
const FloatingLabelInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
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
        placeholder=" " // Crucial for the floating label effect
        required
        className="peer block w-full appearance-none rounded-lg border border-slate/30 bg-dark-navy/60 p-4 pl-12 text-light-slate backdrop-blur-sm transition-colors duration-300 focus:border-brand-gold focus:outline-none focus:ring-0"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-12 top-4 origin-[0] -translate-y-7 scale-75 transform text-sm text-slate duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-brand-gold`}>
        {label}
      </label>
    </div>
  );
};

const TeacherLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password); // Standard login for teachers
      router.push("/portal/teacher-dashboard");
    } catch (err) {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Panel: Branding & Welcome Message */}
      <motion.div
        className="relative hidden flex-col items-center justify-center bg-dark-navy p-12 text-center lg:flex lg:w-1/2"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <div className="z-10">
          <Image
            src="/logo.svg"
            alt="Brightspark Institute Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-light-slate">
            Faculty Portal
          </h1>
          <p className="mt-4 max-w-sm text-lg text-slate">
            Sign in to manage your batches, assignments, and student progress.
          </p>
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

      {/* Right Panel: Login Form */}
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

          <motion.div
            className="relative z-10 space-y-8 rounded-2xl border border-white/10 bg-slate-900/20 p-8 shadow-2xl backdrop-blur-lg"
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-light-slate">
                Teacher Login
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <FloatingLabelInput
                id="email"
                label="Email Address"
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

              <div className="flex items-center justify-between">
                <Link
                  href="#"
                  className="text-sm text-slate hover:text-brand-gold">
                  Forgot Password?
                </Link>
              </div>

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
                    <span>Secure Login</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default TeacherLoginPage;
