"use client";

import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import Hero from "@/components/Hero";
import CaseStudy from "@/components/CaseStudy";
import Guarantee from "@/components/Guarantee";
import Differentiator from "@/components/Differentiator";
import Assessment from "@/components/Assessment";
import ROICalculator from "@/components/ROICalculator";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="relative grid-bg">
      <Navbar />
      <ParticleField />

      <div className="relative z-10">
        <Hero />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <CaseStudy />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald/20 to-transparent" />
        </div>

        <Guarantee />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <Differentiator />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <Assessment />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <ROICalculator />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <Process />

        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <Contact />
      </div>
    </main>
  );
}
