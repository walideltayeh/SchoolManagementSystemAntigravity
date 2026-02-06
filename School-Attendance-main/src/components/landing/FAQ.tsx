import { useRef, useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const faqKeys = [
  { questionKey: "faq.q1", answerKey: "faq.a1" },
  { questionKey: "faq.q2", answerKey: "faq.a2" },
  { questionKey: "faq.q3", answerKey: "faq.a3" },
  { questionKey: "faq.q4", answerKey: "faq.a4" },
  { questionKey: "faq.q5", answerKey: "faq.a5" },
  { questionKey: "faq.q6", answerKey: "faq.a6" },
  { questionKey: "faq.q7", answerKey: "faq.a7" },
  { questionKey: "faq.q8", answerKey: "faq.a8" },
];

export function FAQ() {
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
    <section id="faq" ref={sectionRef} className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-primary text-sm font-semibold mb-3 tracking-wide">{t("faq.label")}</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("faq.subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqKeys.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className={`bg-card border rounded-2xl px-6 data-[state=open]:shadow-lg transition-all duration-500 hover:shadow-md ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <AccordionTrigger className="text-start font-semibold hover:no-underline py-5 hover:text-primary transition-colors">
                {t(faq.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {t(faq.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
