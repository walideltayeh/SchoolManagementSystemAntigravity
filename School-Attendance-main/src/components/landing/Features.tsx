import { useRef, useState, useEffect } from "react";
import {
  QrCode,
  Bus,
  Bell,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  AlertTriangle,
  Users,
  CreditCard,
  MapPin,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const featureKeys = [
  {
    icon: QrCode,
    titleKey: "features.qrBracelet.title",
    descKey: "features.qrBracelet.desc",
    categoryKey: "features.category.attendance",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Bus,
    titleKey: "features.busGps.title",
    descKey: "features.busGps.desc",
    categoryKey: "features.category.transportation",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Bell,
    titleKey: "features.notifications.title",
    descKey: "features.notifications.desc",
    categoryKey: "features.category.communication",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Smartphone,
    titleKey: "features.parentApp.title",
    descKey: "features.parentApp.desc",
    categoryKey: "features.category.communication",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    titleKey: "features.analytics.title",
    descKey: "features.analytics.desc",
    categoryKey: "features.category.analytics",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: AlertTriangle,
    titleKey: "features.emergency.title",
    descKey: "features.emergency.desc",
    categoryKey: "features.category.safety",
    color: "from-red-500 to-red-600",
  },
  {
    icon: Clock,
    titleKey: "features.tardy.title",
    descKey: "features.tardy.desc",
    categoryKey: "features.category.attendance",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: MapPin,
    titleKey: "features.wrongBus.title",
    descKey: "features.wrongBus.desc",
    categoryKey: "features.category.safety",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Shield,
    titleKey: "features.ferpa.title",
    descKey: "features.ferpa.desc",
    categoryKey: "features.category.security",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Users,
    titleKey: "features.multiSchool.title",
    descKey: "features.multiSchool.desc",
    categoryKey: "features.category.admin",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: CreditCard,
    titleKey: "features.billing.title",
    descKey: "features.billing.desc",
    categoryKey: "features.category.admin",
    color: "from-slate-500 to-slate-600",
  },
  {
    icon: FileText,
    titleKey: "features.reports.title",
    descKey: "features.reports.desc",
    categoryKey: "features.category.analytics",
    color: "from-cyan-500 to-teal-500",
  },
];

export function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-primary text-sm font-semibold mb-3 tracking-wide">{t("features.label")}</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("features.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featureKeys.map((feature, idx) => (
            <div
              key={idx}
              className={`group bg-card rounded-2xl border p-6 hover:shadow-xl transition-all duration-500 hover-lift cursor-default ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-secondary mb-3">
                {t(feature.categoryKey)}
              </span>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{t(feature.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
