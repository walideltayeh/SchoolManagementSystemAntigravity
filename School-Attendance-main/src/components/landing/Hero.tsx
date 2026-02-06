import { 
  ArrowRight, 
  QrCode, 
  Bus, 
  Bell,
  Shield,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
  const { t, isRTL } = useLanguage();

  const trustPoints = [
    t("hero.trust.scans"),
    t("hero.trust.gps"),
    t("hero.trust.alerts"),
  ];

  const stats = [
    { value: "<1s", label: t("hero.stat.scanTime") },
    { value: "10s", label: t("hero.stat.alertDelivery") },
    { value: "90%", label: t("hero.stat.fewerCalls") },
  ];

  const activityItems = [
    { icon: QrCode, text: t("hero.activity.checkedIn"), time: t("hero.activity.justNow"), color: "text-accent", bg: "bg-accent/10" },
    { icon: Bus, text: t("hero.activity.busArrived"), time: `2 ${t("hero.activity.minAgo")}`, color: "text-primary", bg: "bg-primary/10" },
    { icon: Bell, text: t("hero.activity.notification"), time: `3 ${t("hero.activity.minAgo")}`, color: "text-warning", bg: "bg-warning/10" },
    { icon: Shield, text: t("hero.activity.accounted"), time: `5 ${t("hero.activity.minAgo")}`, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up hover-scale cursor-default">
            <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 animate-fade-up-delay-1">
            {t("hero.title1")}{" "}
            <span className="text-gradient">{t("hero.title2")}</span>
            <br />
            <span className="text-muted-foreground">{t("hero.title3")}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up-delay-2">
            {t("hero.subtitle")}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-3">
            <a 
              href="#features"
              className={`group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-hero text-white font-medium shadow-glow transition-all hover:shadow-xl hover:scale-105 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {t("hero.cta.features")}
              <ArrowRight className={`h-4 w-4 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </a>
            <a 
              href="#business-case"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-secondary text-foreground font-medium transition-all hover:bg-secondary/80 hover:shadow-lg"
            >
              {t("hero.cta.roi")}
            </a>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-up-delay-3">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center animate-bounce-in"
                style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mt-20 animate-scale-in">
          <div className="relative mx-auto max-w-5xl">
            {/* Main Card */}
            <div className="relative bg-card rounded-3xl shadow-xl border overflow-hidden">
              <div className="grid md:grid-cols-3 gap-6 p-8">
                {/* Live Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    {t("hero.dashboard.live")}
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 hover-lift">
                      <div className="text-3xl font-bold text-accent">285</div>
                      <div className="text-sm text-muted-foreground">{t("hero.dashboard.inClass")}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover-lift">
                      <div className="text-3xl font-bold text-primary">38</div>
                      <div className="text-sm text-muted-foreground">{t("hero.dashboard.inTransit")}</div>
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="md:col-span-2 space-y-4">
                  <div className="text-sm text-muted-foreground">{t("hero.dashboard.activity")}</div>
                  <div className="space-y-2">
                    {activityItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all hover-lift cursor-default"
                        style={{ animationDelay: `${0.8 + idx * 0.1}s` }}
                      >
                        <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.text}</span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
