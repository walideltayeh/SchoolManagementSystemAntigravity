import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Bus, 
  School, 
  Database, 
  CheckCircle2,
  Smartphone,
  User,
  Clock,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ecosystemKeys = [
  {
    icon: User,
    titleKey: "howItWorks.ecosystem1.title",
    descKey: "howItWorks.ecosystem1.desc",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Bus,
    titleKey: "howItWorks.ecosystem2.title",
    descKey: "howItWorks.ecosystem2.desc",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Clock,
    titleKey: "howItWorks.ecosystem3.title",
    descKey: "howItWorks.ecosystem3.desc",
    color: "from-teal-500 to-cyan-500",
  },
];

const workflowKeys = [
  {
    number: "1",
    icon: Bus,
    titleKey: "howItWorks.step1.title",
    descKey: "howItWorks.step1.desc",
    color: "from-amber-500 to-orange-500",
  },
  {
    number: "2",
    icon: School,
    titleKey: "howItWorks.step2.title",
    descKey: "howItWorks.step2.desc",
    color: "from-blue-500 to-blue-600",
  },
  {
    number: "3",
    icon: Database,
    titleKey: "howItWorks.step3.title",
    descKey: "howItWorks.step3.desc",
    color: "from-teal-500 to-cyan-500",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowKeys.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold mb-3 tracking-wide">{t("howItWorks.label")}</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: The QR Code Ecosystem */}
          <div className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h3 className="text-2xl font-semibold text-center lg:text-start mb-8 flex items-center gap-3 justify-center lg:justify-start">
              <QrCode className="h-6 w-6 text-primary" />
              {t("howItWorks.ecosystem")}
            </h3>
            
            <div className="space-y-4">
              {ecosystemKeys.map((item, idx) => (
                <div
                  key={idx}
                  className={`group relative p-6 rounded-2xl bg-card border shadow-sm hover:shadow-xl transition-all duration-500 hover-lift cursor-default ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="flex gap-4">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{t(item.titleKey)}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  </div>
                  
                  {/* Animated connector */}
                  {idx < ecosystemKeys.length - 1 && (
                    <div className={`absolute -bottom-4 ${isRTL ? 'right-10' : 'left-10'} w-0.5 h-8 bg-gradient-to-b from-border to-transparent`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Daily Attendance Workflow */}
          <div className={`space-y-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="text-2xl font-semibold text-center lg:text-start mb-8 flex items-center gap-3 justify-center lg:justify-start">
              <Smartphone className="h-6 w-6 text-accent" />
              {t("howItWorks.workflow")}
            </h3>

            {/* Animated Workflow */}
            <div className="relative">
              {/* Progress line */}
              <div className={`absolute ${isRTL ? 'right-7' : 'left-7'} top-0 bottom-0 w-0.5 bg-border`}>
                <div 
                  className="w-full bg-gradient-to-b from-primary to-accent transition-all duration-500 ease-out"
                  style={{ height: `${((activeStep + 1) / workflowKeys.length) * 100}%` }}
                />
              </div>

              <div className="space-y-6">
                {workflowKeys.map((step, idx) => (
                  <div
                    key={idx}
                    className={`relative ${isRTL ? 'pr-20' : 'pl-20'} transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                    } ${idx === activeStep ? 'scale-105' : 'scale-100'}`}
                    style={{ transitionDelay: `${300 + idx * 150}ms` }}
                  >
                    {/* Step number */}
                    <div 
                      className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        idx <= activeStep 
                          ? `bg-gradient-to-br ${step.color} shadow-lg` 
                          : 'bg-secondary border-2 border-border'
                      }`}
                    >
                      {idx < activeStep ? (
                        <CheckCircle2 className="h-7 w-7 text-white animate-check" />
                      ) : (
                        <step.icon className={`h-7 w-7 ${idx <= activeStep ? 'text-white' : 'text-muted-foreground'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div 
                      className={`p-6 rounded-2xl transition-all duration-500 ${
                        idx === activeStep 
                          ? 'bg-card border shadow-xl' 
                          : 'bg-card/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          idx <= activeStep ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {t("howItWorks.step")} {step.number}
                        </span>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{t(step.titleKey)}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t(step.descKey)}</p>
                      
                      {idx === activeStep && (
                        <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          {t("howItWorks.inProgress")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {workflowKeys.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeStep ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Result */}
        <div className={`mt-20 text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex ${isRTL ? '-space-x-reverse' : ''} -space-x-2`}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full gradient-hero flex items-center justify-center border-2 border-background">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              ))}
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className="font-semibold">{t("howItWorks.result.title")}</div>
              <div className="text-sm text-muted-foreground">{t("howItWorks.result.desc")}</div>
            </div>
            <ArrowRight className={`h-5 w-5 text-primary animate-pulse ${isRTL ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
