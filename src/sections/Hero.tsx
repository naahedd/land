"use client";
import ArrowIcon from "@/assets/arrow-right.svg";
import cogImage from "@/assets/cog.png";
import percentageImage from "@/assets/Group 134.png";
import cursorImage from "@/assets/Group 134 (1).png";
import Image from "next/image";
import Link from "next/link";

import Hands from "@/assets/hands3.png";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef } from "react";

export const Hero = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={heroRef}
      className="pt-8 pb-20 md:pt-5 md:pb-10  overflow-x-clip"
    >
      <div className="container">
        <div className="md:flex items-center">
          <div className="md:w-[478px]">
            {/* <div className="tag">Version 2.0 is here</div> */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-black to-[#804000] text-transparent bg-clip-text mt-6">
            Sick of Generic AI Resumes?
            </h1>
            <div className="text-xl text-[#010D3E] tracking-tight mt-6">
  <h2 className="text-4xl md:text-5xl text-gray-800 mb-8">
    Land Your Dream Role
    <br />
    <span className="font-bold text-gray-800">90% Faster With</span>
    <br />
    <span className="text-orange-600 font-bold">RELEVANT</span>{" "}
    <span className="text-gray-800">Resumes</span>
  </h2>
</div>
            <div className="flex gap-1 items-center mt-[30px]">
            <Link href="/auth/signup"><button className="btn btn-primary">Get for free</button></Link>
              {/* <button className="btn btn-text gap-1">
                <span>Learn more</span>
                <ArrowIcon className="h-5 w-5" />
              </button> */}
            </div>
          </div>
          <div className="hidden md:block md:mt-0 md:h-[648px] md:flex-1 relative">
            <motion.img
              src={Hands.src}
              alt="Cog image"
              className="md:absolute md:h-full md:w-auto md:max-w-none md:-left-6 lg:left-0"
              animate={{
                translateY: [-30, 30],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={percentageImage.src}
              width={220}
              height={220}

              alt="Percentage image"
              className="hidden md:block -top-8 -left-25 md:absolute"
              style={{
                translateY: translateY,
              }}
            />
            <motion.img
              src={cursorImage.src}
              width={220}
              alt="Cursor image"
              className="hidden lg:block absolute top-[524px] left-[448px] rotate-[30deg]"
              style={{
                rotate: -20,
                translateY: translateY,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
