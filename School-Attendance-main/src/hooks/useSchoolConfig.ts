import { useState, useEffect } from "react";

export interface SchoolInfo {
  name: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  version: string;
}

const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  name: "Greenwood Academy",
  logo: "/placeholder.svg",
  contactEmail: "info@greenwood.edu",
  contactPhone: "+1 (555) 123-4567",
  address: "123 Education Lane, Springfield, ST 12345",
  website: "www.greenwood.edu",
  version: "1.0.0"
};

export function useSchoolConfig() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(DEFAULT_SCHOOL_INFO);

  useEffect(() => {
    const stored = localStorage.getItem("schoolInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSchoolInfo({ ...DEFAULT_SCHOOL_INFO, ...parsed });
      } catch (e) {
        console.error("Failed to parse school info:", e);
      }
    }
  }, []);

  const updateSchoolInfo = (updates: Partial<SchoolInfo>) => {
    const updated = { ...schoolInfo, ...updates };
    setSchoolInfo(updated);
    localStorage.setItem("schoolInfo", JSON.stringify(updated));
  };

  return { schoolInfo, updateSchoolInfo };
}
