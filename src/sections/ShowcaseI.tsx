"use client";
import productImage from "@/assets/product-image.png";
import pyramidImage from "@/assets/pyramid.png";
import tubeImage from "@/assets/tube.png";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ShowcaseI = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-[#f2ffd2] to-[#ffffff] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">How We Help</div>
          </div>
          <h2 className="section-title mt-5">
          resum8 personalizes your resume for each company and delivers <span className="text-red-500">BRUTALLY HONEST</span> feedback
          </h2>
          <p className="section-description mt-5 mb-10">
            By tailoring your resume to be a cultural fit, we help you land an interview to the right company.
          </p>
        </div>
        <div className="relative">
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
  {/* Card 1 - Unlock */}
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1 }}
    whileHover={{ y: -8 }}
    className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
  >
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <motion.svg
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </motion.svg>
        </div>
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-60"
        style={{
          top: `${20 + i * 15}%`,
          left: `${70 + i * 10}%`,
        }}
        animate={{
          y: [0, -20, -40],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.5,
        }}
      />
    ))}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 text-center leading-tight">
      Unlocks what companies<br />
      actually want to see
    </h3>
  </motion.div>

  {/* Card 2 - Highlight */}
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    whileHover={{ y: -8 }}
    className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
  >
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <motion.svg
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </motion.svg>
        </div>
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-60"
            style={{
              top: `${20 + i * 15}%`,
              right: `${70 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, -40],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 text-center leading-tight">
      Highlights exactly what will<br />
      impress their hiring team
    </h3>
  </motion.div>

  {/* Card 3 - Growth */}
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    whileHover={{ y: -8 }}
    className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
  >
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <motion.svg
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
            <polyline points="16,7 22,7 22,13"/>
          </motion.svg>
        </div>
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-60"
            style={{
              bottom: `${20 + i * 15}%`,
              left: `${60 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, -40],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 text-center leading-tight">
      Lands more offers with<br />
      feedback that actually works
    </h3>
  </motion.div>
</div>
        </div>
      </div>
    </section>
  );
};
