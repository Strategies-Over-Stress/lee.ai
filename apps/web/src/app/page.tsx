"use client";

import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import Hero from "@/components/Hero";
import CaseStudy from "@/components/CaseStudy";
import Guarantee from "@/components/Guarantee";
import Differentiator from "@/components/Differentiator";
import Assessment from "@/components/Assessment";

import Process from "@/components/Process";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />

      {/* Hero — dark with particles */}
      <div className="relative grid-bg">
        <ParticleField />
        <div className="relative z-10">
          <Hero />
        </div>
      </div>

      {/* Case Study — white background */}
      <div className="bg-white text-gray-900">
        <CaseStudy />
      </div>

      {/* Guarantee — emerald gradient */}
      <div className="bg-gradient-to-b from-emerald-950 via-emerald-900/80 to-midnight">
        <Guarantee />
      </div>

      {/* Differentiator — dark with accent tint */}
      <div className="bg-gradient-to-b from-midnight via-accent/[0.04] to-midnight">
        <Differentiator />
      </div>

      {/* Assessment — white background */}
      <div className="bg-white text-gray-900">
        <Assessment />
      </div>

      {/* Process — dark */}
      <div className="bg-surface">
        <Process />
      </div>

      {/* Contact — bright blue gradient */}
      <div className="bg-gradient-to-b from-accent/20 via-accent/10 to-midnight">
        <Contact />
      </div>
    </main>
  );
}
