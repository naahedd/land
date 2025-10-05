import Image from "next/image";
import logo from "@/assets/r83.png";
import SocialX from "@/assets/social-x.svg";
import SocialInsta from "@/assets/social-insta.svg";
import SocialLinkedIn from "@/assets/social-linkedin.svg";
import SocialPin from "@/assets/social-pin.svg";
import SocialYoutube from "@/assets/social-youtube.svg";
import PrivacyPage from "@/sections/PrivacyPage";
import TermsPage from "@/sections/TermsPage";
import Link from "next/link";



export const Footer = () => {
  return (
    <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center">
      <div className="container">
        <div className="inline-flex relative before:content-[''] before:top-1 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
          <Image src={logo} height={40} alt="SaaS logo" className="relative" />
        </div>
        <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
        <nav className="flex gap-6">
      <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      <Link href="/terms" className="hover:underline">Terms of Service</Link>
    </nav>
          {/* <a href="#">Careers</a>
          <a href="#">Pricing</a>
          <a href="#">Help</a> */}
        </nav>
        {/* <div className="flex justify-center gap-6 mt-6">
          <SocialX />
          <SocialInsta />
          <SocialLinkedIn />
          <SocialPin />
          <SocialYoutube />
        </div> */}
        <p className="mt-6">
          &copy; 2025 Resum8, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
