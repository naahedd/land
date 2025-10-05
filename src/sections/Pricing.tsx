"use client";
import CheckIcon from "@/assets/check.svg";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import Link from "next/link";

const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: false,
    features: [
      "Upload 1 resume only",
      "Create up to 3 tailored versions/day",
      "Company-specific tailoring for resumes",
      "General project & work experience suggestions",
      "Basic company & startup recommendations",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 10,
    buttonText: "Sign up now",
    popular: true,
    inverse: true,
    features: [
      "Unlimited resume uploads & tailored versions",
      "Smart Resume Focus Slider (save hours)",
      "Application performance analytics & tracking (coming soon!)",
      "Project blueprints drawn directly from successful hires at target companies",
      "Advanced company & hidden-startup recommendations",
    ],
  },
 
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title">Pricing</h2>
          <p className="section-description mt-5">
          Other tools lock you into subscriptions. We give you unlimited power for a one-time $10.
          </p>
        </div>
        <div className="flex flex-col gap-32 items-center mt-10 lg:flex-row lg:items-end lg:justify-center">
          {pricingTiers.map(
            ({
              title,
              monthlyPrice,
              buttonText,
              popular,
              inverse,
              features,
            }) => (
              <div
                key={title}
                className={twMerge(
                  "card",
                  inverse === true && "border-black bg-black text-white"
                )}
              >
                <div className="flex justify-between">
                  <h3
                    className={twMerge(
                      "text-lg font-bold text-black/50",
                      inverse === true && "text-white/60"
                    )}
                  >
                    {title}
                  </h3>
                  {popular === true && (
                    <div className="inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20">
                      <motion.span
                        animate={{
                          backgroundPositionX: "100%",
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                          repeatType: "loop",
                        }}
                        className="bg-[linear-gradient(to_right,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF)] [background-size:200%] text-transparent bg-clip-text font-medium"
                      >
                        Popular
                      </motion.span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none">
                    ${monthlyPrice}
                  </span>
                  {title !== 'Pro' && (
  <span className="tracking-tight font-bold text-black/50">
    /month
  </span>
)}
                </div>
                <button
                  className={twMerge(
                    "btn btn-primary w-full mt-[30px]",
                    inverse === true && "bg-white text-black"
                  )}
                >
                  <Link href="/auth/signup">{buttonText}</Link>
                  
                </button>
                <ul className="flex flex-col gap-5 mt-8">
                  {features.map((feature) => (
                    <li key={feature} className="text-sm flex items-center gap-4">
                      <CheckIcon className="h-6 w-6 flex-shrink-0"/>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
