import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const parentPricing = {
  recommended: { annual: 125, deposit: 25 },
  optionA: { setup: 50, annual: 120 },
  optionB: { annual: 150 },
};

export function Pricing() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  const schoolPlans = [
    {
      nameKey: "pricing.basic",
      price: 2000,
      descKey: "pricing.basicDesc",
      featureKeys: [
        "pricing.feature.qrAttendance",
        "pricing.feature.basicReporting",
        "pricing.feature.upTo200",
        "pricing.feature.emailSupport",
        "pricing.feature.webDashboard",
      ],
      popular: false,
    },
    {
      nameKey: "pricing.premium",
      price: 3500,
      descKey: "pricing.premiumDesc",
      featureKeys: [
        "pricing.feature.everythingBasic",
        "pricing.feature.busGps",
        "pricing.feature.parentApp",
        "pricing.feature.advancedAnalytics",
        "pricing.feature.upTo500",
        "pricing.feature.prioritySupport",
      ],
      popular: true,
    },
    {
      nameKey: "pricing.enterprise",
      price: 6000,
      descKey: "pricing.enterpriseDesc",
      featureKeys: [
        "pricing.feature.everythingPremium",
        "pricing.feature.multiSchool",
        "pricing.feature.apiAccess",
        "pricing.feature.customIntegrations",
        "pricing.feature.unlimitedStudents",
        "pricing.feature.dedicatedManager",
      ],
      popular: false,
    },
  ];

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
    <section id="pricing" ref={sectionRef} className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-primary text-sm font-semibold mb-3 tracking-wide">{t("pricing.label")}</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* School Plans */}
        <div className="mb-20">
          <h3 className="text-xl font-semibold text-center mb-8">{t("pricing.schoolPlans")}</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {schoolPlans.map((plan, idx) => (
              <Card
                key={plan.nameKey}
                className={`relative overflow-hidden transition-all duration-500 hover-lift ${
                  plan.popular ? "ring-2 ring-primary shadow-glow scale-105" : "hover:shadow-xl"
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0">
                    <div className="gradient-hero text-white text-center text-sm font-medium py-2 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t("pricing.recommended")}
                    </div>
                  </div>
                )}
                <CardHeader className={plan.popular ? "pt-14" : ""}>
                  <CardTitle className="text-center">
                    <span className="text-2xl font-bold">{t(plan.nameKey)}</span>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">{t("pricing.year")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">
                      {t(plan.descKey)}
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.featureKeys.map((featureKey, fidx) => (
                      <li key={fidx} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all hover:scale-105 ${
                      plan.popular 
                        ? "gradient-hero text-white shadow-glow hover:shadow-xl" 
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {t("pricing.getStarted")}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Parent Pricing */}
        <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-xl font-semibold text-center mb-8">{t("pricing.parentOptions")}</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover-lift hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-sm font-medium mb-4">
                  Option A
                </span>
                <p className="text-3xl font-bold">
                  ${parentPricing.optionA.setup} + ${parentPricing.optionA.annual}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("pricing.setupAnnual")}</p>
              </CardContent>
            </Card>
            
            <Card className="ring-2 ring-accent shadow-glow-accent hover-lift relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 gradient-accent text-white text-center text-xs font-medium py-1.5">
                {t("pricing.bestValue")}
              </div>
              <CardContent className="p-6 text-center pt-10">
                <span className="inline-block px-3 py-1 rounded-full gradient-accent text-white text-sm font-medium mb-4">
                  {t("pricing.recommended")}
                </span>
                <p className="text-3xl font-bold text-accent">
                  ${parentPricing.recommended.annual}<span className="text-lg">{t("pricing.year")}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  + ${parentPricing.recommended.deposit} {t("pricing.refundableDeposit")}
                </p>
                <p className="text-xs text-accent mt-2 font-semibold">
                  {t("pricing.onlyPerDay")}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover-lift hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-sm font-medium mb-4">
                  Option B
                </span>
                <p className="text-3xl font-bold">
                  ${parentPricing.optionB.annual}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("pricing.annualNoSetup")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Family Discounts */}
          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 border border-accent/20 text-sm flex-wrap justify-center">
              <span className="text-accent font-semibold">{t("pricing.familyDiscounts")}</span>
              <span className="text-muted-foreground">{t("pricing.secondChild")} • {t("pricing.thirdChild")}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
