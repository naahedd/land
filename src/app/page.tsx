import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { LogoTicker } from "@/sections/LogoTicker";
import { ProductShowcase } from "@/sections/ProductShowcase";
import { Pricing } from "@/sections/Pricing";
import { Testimonials } from "@/sections/Testimonials";
import { CallToAction } from "@/sections/CallToAction";
import { Footer } from "@/sections/Footer";
import { ShowcaseI } from "@/sections/ShowcaseI";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is already signed in
  const session = await getServerSession(authOptions);
  
  // If user has a session, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <Hero />
      <LogoTicker />
      <ProductShowcase />
      <ShowcaseI />
      <Pricing />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  );
}