import "@/index_lovable.css";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { HowItWorks as HowItWorksSection } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { BusinessCase } from "@/components/landing/BusinessCase";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <div className="section-divider max-w-5xl mx-auto" />
        <ProblemSolution />
        <div className="section-divider max-w-5xl mx-auto" />
        <HowItWorksSection />
        <div className="section-divider max-w-5xl mx-auto" />
        <Features />
        <div className="section-divider max-w-5xl mx-auto" />
        <BusinessCase />
        <div className="section-divider max-w-5xl mx-auto" />
        <Pricing />
        <div className="section-divider max-w-5xl mx-auto" />
        <FAQ />
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default HowItWorks;

