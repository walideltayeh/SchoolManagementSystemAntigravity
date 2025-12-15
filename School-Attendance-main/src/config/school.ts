// This file provides default values. Actual values are managed through Settings page
// and stored in localStorage. Use useSchoolConfig() hook to access current values.

export const SCHOOL_CONFIG = {
  name: "Greenwood Academy",
  logo: "/placeholder.svg",
  version: "1.0.0"
};

// Helper to get current school config from localStorage
export function getSchoolConfig() {
  if (typeof window === 'undefined') return SCHOOL_CONFIG;
  
  const stored = localStorage.getItem("schoolInfo");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...SCHOOL_CONFIG, ...parsed };
    } catch (e) {
      console.error("Failed to parse school info:", e);
    }
  }
  return SCHOOL_CONFIG;
}
