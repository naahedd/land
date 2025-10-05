"use client";
import google from "@/assets/google.png";
import amazonLogo from "@/assets/amazon.png";
import metaLogo from "@/assets/meta.png";
import airbnbLogo from "@/assets/airbnb.png";
import microsoftLogo from "@/assets/microsoft.png";
import Image from "next/image";
import { motion } from "framer-motion";
import tesla from "@/assets/tesla.png";

export const LogoTicker = () => {
  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="container">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <motion.div
            className="flex gap-14 flex-none pr-14"
            animate={{
              translateX: "-50%",
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          >
            <Image
              src={tesla}
              alt=" Logo"
              className="logo-ticker-image w-30 h-30"
            />
            <Image
              src={google}
              alt=" Logo"
              className="logo-ticker-image w-30 h-30"
            />
            <Image
              src={amazonLogo}
              alt=" Logo"
              className="logo-ticker-image"
            />
            <Image
              src={metaLogo}
              alt=" Logo"
              className="logo-ticker-image w-30 h-30"
            />
            <Image
              src={airbnbLogo}
              alt=" Logo"
              className="logo-ticker-image"
            />
            {/* <Image
              src={apexLogo}
              alt="Apex Logo"
              className="logo-ticker-image"
            /> */}

            {/* Second set of logos for animation */}
            <Image
              src={tesla}
              alt=" Logo"
              className="logo-ticker-image w-20 h-20"
              
            />
            <Image
              src={google}
              alt=" Logo"
              className="logo-ticker-image w-30 h-30"
            />
            <Image
              src={microsoftLogo}
              alt=" Logo"
              className="logo-ticker-image"
            />
            <Image
              src={metaLogo}
              alt=" Logo"
              className="logo-ticker-image"
            />
            <Image
              src={airbnbLogo}
              alt=" Logo"
              className="logo-ticker-image"
            />
            {/* <Image
              src={apexLogo}
              alt="Apex Logo"
              className="logo-ticker-image"
            /> */}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
