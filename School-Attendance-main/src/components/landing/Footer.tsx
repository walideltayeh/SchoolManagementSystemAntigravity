import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedQRLogo } from "./AnimatedQRLogo";

const footerLinkKeys = [
  { labelKey: "footer.features", href: "#features" },
  { labelKey: "footer.howItWorks", href: "#how-it-works" },
  { labelKey: "footer.pricing", href: "#pricing" },
  { labelKey: "footer.roiCalculator", href: "#business-case" },
  { labelKey: "footer.faq", href: "#faq" },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <AnimatedQRLogo size={44} />
            <span className="font-semibold text-lg">{t("footer.brand")}</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinkKeys.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>{t("footer.copyright")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
