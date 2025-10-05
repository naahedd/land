"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar8 from "@/assets/avatar-8.png";
import avatar9 from "@/assets/avatar-9.png";
import avatar10 from "@/assets/avatar-10.jpg";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";

const testimonials = [
  {
    text: "Showed me exactly why I wasn't getting callbacks. Fixed the issues, got interviews.",
    imageSrc: avatar1.src,
    name: "Riley Smith",
    // username: "@rileysmith1",
  },
  {
    text: "The project suggestions were actually useful. Built one, added it, definitely helped.",
    imageSrc: avatar2.src,
    name: "Josh Smith",
    // username: "@jjsmith",
  },
  {
    text: "Found companies I hadn't considered. One of them hired me.",
    imageSrc: avatar3.src,
    name: "Morgan Lee",
    // username: "@morganleewhiz",
  },
  {
    text: "Better than generic resume advice. Actually specific to the jobs I wanted.",
    imageSrc: avatar4.src,
    name: "Casey Jordan",
    // username: "@caseyj",
  },
  {
    text: "Helped me understand what tech companies actually care about. Wish I'd found this sooner.",
    imageSrc: avatar5.src,
    name: "Taylor Kim",
    // username: "@taylorkimm",
  },
  {
    text: "Showed me a Python automation project that Spotify engineers built. Made something similar, got the interview.",
    imageSrc: avatar10.src,
    name: "Anh Le",
    // username: "@jamietechguru00",
  },
  {
    text: "Straightforward feedback. No fluff. Told me what to fix and how.",
    imageSrc: avatar7.src,
    name: "Jordan Patels",
    // username: "@jpatelsdesign",
  },
  {
    text: "Career changer here. Helped me translate my old experience into tech language.",
    imageSrc: avatar8.src,
    name: "Sam Dawson",
    // username: "@dawsontechtips",
  },
  {
    text: "Cheap enough to try, useful enough to keep. Good tool.",
    imageSrc: avatar9.src,
    name: "Casey Harper",
    // username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      animate={{
        translateY: "-50%",
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {[...new Array(2)].fill(0).map((_, index) => (
        <React.Fragment key={index}>
          {props.testimonials.map(({ text, imageSrc, name }) => (
            <div className="card" key={index}>
              <div>{text}</div>
              <div className="flex items-center gap-2 mt-5">
                <Image
                  src={imageSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <div className="font-medium tracking-tight leading-5">
                    {name}
                  </div>
                  {/* <div className="leading-5 tracking-tight">{username}</div> */}
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Testimonials</div>
          </div>
          <h2 className="section-title mt-5">What our users say</h2>
          <p className="section-description mt-5">
          Some love it, some like it, all got value from it.
          </p>
        </div>
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
