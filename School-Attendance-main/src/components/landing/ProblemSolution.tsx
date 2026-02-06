import { useRef, useState, useEffect } from "react";
import { 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  FileQuestion, 
  Users,
  Zap,
  Bell,
  BarChart3,
  Shield
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const problemKeys = [
  { icon: Clock, titleKey: "problem.manualAttendance.title", descKey: "problem.manualAttendance.desc" },
  { icon: Phone, titleKey: "problem.parentsInDark.title", descKey: "problem.parentsInDark.desc" },
  { icon: FileQuestion, titleKey: "problem.inaccurateRecords.title", descKey: "problem.inaccurateRecords.desc" },
  { icon: Users, titleKey: "problem.officeOverwhelmed.title", descKey: "problem.officeOverwhelmed.desc" },
];

const solutionKeys = [
  { icon: Zap, titleKey: "solution.qrScans.title", descKey: "solution.qrScans.desc" },
  { icon: Bell, titleKey: "solution.parentAlerts.title", descKey: "solution.parentAlerts.desc" },
  { icon: BarChart3, titleKey: "solution.digitalAccuracy.title", descKey: "solution.digitalAccuracy.desc" },
  { icon: Shield, titleKey: "solution.fewerCalls.title", descKey: "solution.fewerCalls.desc" },
];

export function ProblemSolution() {
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

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("problemSolution.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("problemSolution.subtitle")}
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Problems Column */}
          <div className="space-y-4">
            <div className={`flex items-center gap-3 mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-semibold">{t("problemSolution.challenges")}</h3>
            </div>
            <div className="space-y-3">
              {problemKeys.map((problem, idx) => (
                <div
                  key={idx}
                  className={`group flex gap-4 p-5 rounded-2xl bg-card border border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-500 hover-lift ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                    <problem.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <h4 className="font-semibold mb-1">{t(problem.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(problem.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <div className={`flex items-center gap-3 mb-6 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">{t("problemSolution.solution")}</h3>
            </div>
            <div className="space-y-3">
              {solutionKeys.map((solution, idx) => (
                <div
                  key={idx}
                  className={`group flex gap-4 p-5 rounded-2xl bg-card border border-accent/10 hover:border-accent/30 hover:shadow-lg transition-all duration-500 hover-lift ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${200 + idx * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shrink-0 group-hover:shadow-glow-accent transition-all group-hover:scale-110">
                    <solution.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <h4 className="font-semibold mb-1">{t(solution.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(solution.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
