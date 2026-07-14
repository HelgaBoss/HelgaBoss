import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* Reusable fade / rise on scroll */
export function Reveal({ children, className, delay = 0, y = 24, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Container({ className, children }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-2 text-primary", className)}>
      <span className="h-px w-6 bg-primary/60" />
      {children}
    </span>
  );
}

/* Stylized undulating "Montfort" roof mark */
export function Logo({ className, tone = "currentColor" }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M2 26c6-16 12-16 18-2 6-14 12-14 18 2"
        stroke={tone}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M2 30c6-14 12-14 18-2 6-12 12-12 18 2"
        stroke={tone}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
