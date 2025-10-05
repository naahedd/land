"use client";
import ArrowRight from "@/assets/arrow-right.svg";
import smileyImage from "@/assets/p59 1.png";
import cubeImage from "@/assets/Cube6 - Transparent.png";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import router from "next/router";
import Link from "next/link";

export const CallToAction = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-[#D2DCFF] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading relative">
          <h2 className="section-title">Sign up for free today</h2>
          <p className="section-description mt-5">
          Everyone tells you to tailor your resume but nobody shows you how. We do. See exactly which projects <span className="font-bold">Microsoft</span> engineers had on their resumes. Know which skills got designers into <span className="font-bold">Figma</span>. Learn what made marketing managers stand out to <span className="font-bold">Nike</span>. Real examples from real hires, personalized for your goals.
          </p>
          <motion.img
            src={smileyImage.src}
            alt="Smiley Image"
            width={360}
            className="absolute -left-[350px] -top-[137px]"
            style={{
              translateY,
            }}
          />
          <motion.img
            src={cubeImage.src}
            alt="Cube Image"
            width={360}
            className="absolute -right-[342px] -top-[19px]"
            style={{
              translateY,
            }}
          />
        </div>
        <div className="flex gap-2 mt-10 justify-center">
        <Link href="/auth/signup" className="btn btn-primary">Get for free</Link>
          {/* <button className="btn btn-text gap-1">
            <span>Learn more</span>
            <ArrowRight className="h-5 w-5" />
          </button> */}
        </div>
      </div>
    </section>
  );
};
