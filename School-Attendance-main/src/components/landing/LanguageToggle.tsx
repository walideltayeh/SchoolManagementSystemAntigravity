import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
    >
      <Globe className="h-4 w-4" />
      <span>{language === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
