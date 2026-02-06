import { useState, useEffect } from "react";
import { Menu, X, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { AnimatedQRLogo } from "./AnimatedQRLogo";
import { Link } from "react-router-dom";

const navLinkKeys = [
  { labelKey: "nav.features", href: "#features" },
  { labelKey: "nav.howItWorks", href: "#how-it-works" },
  { labelKey: "nav.businessCase", href: "#business-case" },
  { labelKey: "nav.pricing", href: "#pricing" },
  { labelKey: "nav.faq", href: "#faq" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/90 backdrop-blur-xl shadow-lg py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <AnimatedQRLogo size={44} className="transition-all group-hover:scale-105" />
            <span className="font-semibold text-lg tracking-tight">School Attendance Management System (SAMS)</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary group flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Welcome Page
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-1/2" />
            </Link>
            {navLinkKeys.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary group"
              >
                {t(link.labelKey)}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-1/2" />
              </a>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b transition-all duration-300 ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="px-4 py-6 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 py-3 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-4 w-4" />
            Welcome Page
          </Link>
          {navLinkKeys.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t(link.labelKey)}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
