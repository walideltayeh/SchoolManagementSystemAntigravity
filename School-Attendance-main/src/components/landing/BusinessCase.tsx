import { useState, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  Building2,
  GraduationCap,
  BarChart3,
  Lock,
  Zap,
  Target,
  LineChart,
  PieChart,
  Brain,
  Database,
  FileText,
  AlertTriangle,
  ThumbsUp,
  Award,
  Sparkles,
  Bus,
  DoorOpen,
  Info,
  ChevronDown,
  Settings2,
  Download
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Default school size configurations
const defaultSchoolConfigs = {
  small: { students: 150, buses: 2, rooms: 15 },
  medium: { students: 400, buses: 5, rooms: 35 },
  large: { students: 800, buses: 10, rooms: 60 },
};

export function BusinessCase() {
  const [selectedScenario, setSelectedScenario] = useState<"small" | "medium" | "large">("medium");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { t, isRTL } = useLanguage();
  
  // Editable school configurations
  const [schoolConfigs, setSchoolConfigs] = useState(defaultSchoolConfigs);
  
  // Pricing assumptions (customizable)
  const [pricingAssumptions, setPricingAssumptions] = useState({
    annualFeePerStudent: 125,
    braceletCost: 15,
    tabletCost: 300,
    gpsCost: 250,
  });
  
  const [pricingInputs, setPricingInputs] = useState({
    annualFeePerStudent: "125",
    braceletCost: "15",
    tabletCost: "300",
    gpsCost: "250",
  });
  
  const [showPricingSettings, setShowPricingSettings] = useState(false);
  
  // Temporary input values to allow empty fields while typing
  const [inputValues, setInputValues] = useState<{
    students: string;
    buses: string;
    rooms: string;
  }>({
    students: String(defaultSchoolConfigs.medium.students),
    buses: String(defaultSchoolConfigs.medium.buses),
    rooms: String(defaultSchoolConfigs.medium.rooms),
  });

  const schoolLabels = {
    small: t("businessCase.smallSchool"),
    medium: t("businessCase.mediumSchool"), 
    large: t("businessCase.largeSchool"),
  };

  // Update input values when scenario changes
  useEffect(() => {
    setInputValues({
      students: String(schoolConfigs[selectedScenario].students),
      buses: String(schoolConfigs[selectedScenario].buses),
      rooms: String(schoolConfigs[selectedScenario].rooms),
    });
  }, [selectedScenario, schoolConfigs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (field: "students" | "buses" | "rooms", value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: "students" | "buses" | "rooms", minValue: number) => {
    const numValue = parseInt(inputValues[field]) || 0;
    const clampedValue = Math.max(minValue, numValue);
    setSchoolConfigs(prev => ({
      ...prev,
      [selectedScenario]: { ...prev[selectedScenario], [field]: clampedValue }
    }));
    setInputValues(prev => ({ ...prev, [field]: String(clampedValue) }));
  };

  const handlePricingInputChange = (field: keyof typeof pricingInputs, value: string) => {
    setPricingInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePricingInputBlur = (field: keyof typeof pricingAssumptions, minValue: number) => {
    const numValue = parseInt(pricingInputs[field]) || minValue;
    const clampedValue = Math.max(minValue, numValue);
    setPricingAssumptions(prev => ({ ...prev, [field]: clampedValue }));
    setPricingInputs(prev => ({ ...prev, [field]: String(clampedValue) }));
  };

  const currentConfig = schoolConfigs[selectedScenario];

  const financials = useMemo(() => {
    const { students, buses, rooms: classrooms } = currentConfig;
    const { annualFeePerStudent, braceletCost, tabletCost, gpsCost } = pricingAssumptions;
    
    // ===== HARDWARE COSTS =====
    const braceletBuffer = 1.15; // 15% extra for spares
    const bracelets = Math.ceil(students * braceletBuffer);
    const braceletTotal = bracelets * braceletCost;

    const tablets = classrooms + 5; // +5 for admin/office
    const tabletTotal = tablets * tabletCost;

    const gpsTotal = buses * gpsCost;

    const chargingStations = Math.ceil(students / 100);
    const chargingCost = 500;
    const chargingTotal = chargingStations * chargingCost;

    const serverHardware = 2500;
    const networkEquipment = 1500;
    
    const totalHardware = braceletTotal + tabletTotal + gpsTotal + chargingTotal + serverHardware + networkEquipment;

    // ===== INSTALLATION & SETUP =====
    const installationLabor = 3500;
    const softwareSetup = 2000;
    const staffTraining = 1500;
    const projectManagement = 2000;
    const totalInstallation = installationLabor + softwareSetup + staffTraining + projectManagement;

    // ===== ANNUAL COSTS =====
    const platformLicense = students <= 200 ? 2000 : students <= 500 ? 3500 : 6000;
    const maintenanceSupport = 1200;
    const annualReplacements = Math.ceil(students * 0.05) * braceletCost; // 5% replacement
    const cloudHosting = 600;
    const totalAnnualCosts = platformLicense + maintenanceSupport + annualReplacements + cloudHosting;

    // ===== TOTAL INITIAL INVESTMENT =====
    const totalInitialInvestment = totalHardware + totalInstallation;

    // ===== REVENUE (from parent subscriptions) =====
    // 100% enrollment - all students participate
    const enrolledStudents = students;
    
    const annualSubscriptionRevenue = enrolledStudents * annualFeePerStudent;
    const replacementFeeRevenue = Math.ceil(enrolledStudents * 0.03) * 20; // 3% lose/damage

    const year1GrossRevenue = annualSubscriptionRevenue + replacementFeeRevenue;
    const recurringAnnualRevenue = annualSubscriptionRevenue + replacementFeeRevenue;

    // ===== TUITION INTEGRATION =====
    const hardwareCostPerStudent = Math.ceil(totalHardware / students);
    const tuitionTechFee = annualFeePerStudent + hardwareCostPerStudent;
    const dailySubscriptionCost = (annualFeePerStudent / 180).toFixed(2); // Fixed $0.69
    
    // Dynamic total cost per student (includes hardware amortized over 3 years + annual costs)
    const hardwareAmortizedPerStudent = (totalHardware / 3) / students; // 3-year hardware life
    const annualCostPerStudent = totalAnnualCosts / students;
    const totalAnnualCostPerStudent = hardwareAmortizedPerStudent + annualCostPerStudent;
    const dynamicDailyCost = (totalAnnualCostPerStudent / 180).toFixed(2);

    // ===== MULTI-YEAR PROJECTIONS =====
    const year1NetProfit = year1GrossRevenue - totalInitialInvestment - totalAnnualCosts;
    const yearlyNetProfit = recurringAnnualRevenue - totalAnnualCosts;
    
    const projections = [1, 2, 3, 4, 5].map(year => {
      const cumulativeRevenue = year === 1 
        ? year1GrossRevenue 
        : year1GrossRevenue + (recurringAnnualRevenue * (year - 1));
      const cumulativeCosts = totalInitialInvestment + (totalAnnualCosts * year);
      const cumulativeProfit = cumulativeRevenue - cumulativeCosts;
      const yearRevenue = year === 1 ? year1GrossRevenue : recurringAnnualRevenue;
      const yearCosts = year === 1 ? totalInitialInvestment + totalAnnualCosts : totalAnnualCosts;
      const yearProfit = yearRevenue - yearCosts;
      
      return {
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        profit: yearProfit,
        cumulativeRevenue,
        cumulativeCosts,
        cumulativeProfit,
      };
    });

    // With tuition integration (zero-risk model)
    const tuitionProjections = [1, 2, 3, 4, 5].map(year => {
      const yearRevenue = year === 1 ? year1GrossRevenue : recurringAnnualRevenue;
      const yearCosts = year === 1 ? totalInstallation + totalAnnualCosts : totalAnnualCosts; // No hardware cost
      const yearProfit = yearRevenue - yearCosts;
      const cumulativeRevenue = year === 1 
        ? year1GrossRevenue 
        : year1GrossRevenue + (recurringAnnualRevenue * (year - 1));
      const cumulativeCosts = totalInstallation + (totalAnnualCosts * year);
      const cumulativeProfit = cumulativeRevenue - cumulativeCosts;
      
      return {
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        profit: yearProfit,
        cumulativeRevenue,
        cumulativeCosts,
        cumulativeProfit,
      };
    });

    const breakEvenMonths = Math.ceil(totalInitialInvestment / (yearlyNetProfit / 12));
    const tuitionBreakEvenMonths = Math.ceil(totalInstallation / ((recurringAnnualRevenue - totalAnnualCosts) / 12));
    const roi5Year = ((projections[4].cumulativeProfit / totalInitialInvestment) * 100).toFixed(0);
    const tuitionRoi5Year = ((tuitionProjections[4].cumulativeProfit / totalInstallation) * 100).toFixed(0);

    return {
      // Hardware breakdown
      hardware: {
        bracelets: { qty: bracelets, unit: braceletCost, total: braceletTotal },
        tablets: { qty: tablets, unit: tabletCost, total: tabletTotal },
        gps: { qty: buses, unit: gpsCost, total: gpsTotal },
        charging: { qty: chargingStations, unit: chargingCost, total: chargingTotal },
        server: serverHardware,
        network: networkEquipment,
        total: totalHardware,
      },
      // Installation breakdown
      installation: {
        labor: installationLabor,
        software: softwareSetup,
        training: staffTraining,
        projectMgmt: projectManagement,
        total: totalInstallation,
      },
      // Annual costs
      annual: {
        platform: platformLicense,
        maintenance: maintenanceSupport,
        replacements: annualReplacements,
        hosting: cloudHosting,
        total: totalAnnualCosts,
      },
      // Revenue
      revenue: {
        enrolledStudents,
        subscriptions: annualSubscriptionRevenue,
        replacements: replacementFeeRevenue,
        year1Gross: year1GrossRevenue,
        recurring: recurringAnnualRevenue,
      },
      // Tuition integration
      tuition: {
        hardwarePerStudent: hardwareCostPerStudent,
        techFee: tuitionTechFee,
        dailySubscription: dailySubscriptionCost,
        dynamicDailyCost: dynamicDailyCost,
        totalAnnualCostPerStudent: totalAnnualCostPerStudent.toFixed(2),
      },
      // Totals
      totalInitialInvestment,
      projections,
      tuitionProjections,
      breakEvenMonths,
      tuitionBreakEvenMonths,
      roi5Year,
      tuitionRoi5Year,
      year1NetProfit,
      yearlyNetProfit,
      // Include inputs for display
      inputs: {
        students: currentConfig.students,
        buses: currentConfig.buses,
        rooms: currentConfig.rooms,
      },
      // Pricing for display
      pricing: {
        annualFeePerStudent,
        braceletCost,
        tabletCost,
        gpsCost,
      },
    };
  }, [currentConfig, pricingAssumptions]);

  // Download executive package as text file
  const handleDownloadPackage = () => {
    const content = `
═══════════════════════════════════════════════════════════════
                    EXECUTIVE SUMMARY PACKAGE
                    School Safety System ROI
═══════════════════════════════════════════════════════════════

SCHOOL CONFIGURATION
────────────────────────────────────────────────────────────────
• Students: ${financials.inputs.students}
• Buses: ${financials.inputs.buses}
• Classrooms: ${financials.inputs.rooms}

PRICING ASSUMPTIONS
────────────────────────────────────────────────────────────────
• Annual Fee per Student: $${financials.pricing.annualFeePerStudent}
• Bracelet Cost: $${financials.pricing.braceletCost}
• Tablet Cost: $${financials.pricing.tabletCost}
• GPS Module Cost: $${financials.pricing.gpsCost}

HARDWARE COSTS
────────────────────────────────────────────────────────────────
• Bracelets (${financials.hardware.bracelets.qty} units): $${financials.hardware.bracelets.total.toLocaleString()}
• Tablets (${financials.hardware.tablets.qty} units): $${financials.hardware.tablets.total.toLocaleString()}
• GPS Modules (${financials.hardware.gps.qty} units): $${financials.hardware.gps.total.toLocaleString()}
• Charging Stations (${financials.hardware.charging.qty} units): $${financials.hardware.charging.total.toLocaleString()}
• Server Hardware: $${financials.hardware.server.toLocaleString()}
• Network Equipment: $${financials.hardware.network.toLocaleString()}
────────────────────────────────────────────────────────────────
HARDWARE SUBTOTAL: $${financials.hardware.total.toLocaleString()}

INSTALLATION & SETUP
────────────────────────────────────────────────────────────────
• Installation Labor: $${financials.installation.labor.toLocaleString()}
• Software Configuration: $${financials.installation.software.toLocaleString()}
• Staff Training: $${financials.installation.training.toLocaleString()}
• Project Management: $${financials.installation.projectMgmt.toLocaleString()}
────────────────────────────────────────────────────────────────
SETUP SUBTOTAL: $${financials.installation.total.toLocaleString()}

═══════════════════════════════════════════════════════════════
TOTAL INITIAL INVESTMENT: $${financials.totalInitialInvestment.toLocaleString()}
═══════════════════════════════════════════════════════════════

ANNUAL OPERATING COSTS
────────────────────────────────────────────────────────────────
• Platform License: $${financials.annual.platform.toLocaleString()}/year
• Maintenance & Support: $${financials.annual.maintenance.toLocaleString()}/year
• Est. Replacements (5%): $${financials.annual.replacements.toLocaleString()}/year
• Cloud Hosting: $${financials.annual.hosting.toLocaleString()}/year
────────────────────────────────────────────────────────────────
ANNUAL TOTAL: $${financials.annual.total.toLocaleString()}/year

REVENUE SOURCES (from Parent Subscriptions)
────────────────────────────────────────────────────────────────
• Enrolled Students: ${financials.revenue.enrolledStudents} (100% enrollment)
• Annual Subscriptions: $${financials.revenue.subscriptions.toLocaleString()}
• Replacement Fees: $${financials.revenue.replacements.toLocaleString()}
────────────────────────────────────────────────────────────────
YEAR 1 GROSS REVENUE: $${financials.revenue.year1Gross.toLocaleString()}

5-YEAR FINANCIAL PROJECTION
════════════════════════════════════════════════════════════════
Year    Revenue         Costs           Net Profit      Cumulative
────────────────────────────────────────────────────────────────
${financials.projections.map(row => 
`Year ${row.year}   $${row.revenue.toLocaleString().padEnd(12)}  $${row.costs.toLocaleString().padEnd(12)}  ${row.profit >= 0 ? '+' : ''}$${row.profit.toLocaleString().padEnd(10)}  ${row.cumulativeProfit >= 0 ? '+' : ''}$${row.cumulativeProfit.toLocaleString()}`
).join('\n')}
════════════════════════════════════════════════════════════════

KEY METRICS
────────────────────────────────────────────────────────────────
• Break-Even Point: ${financials.breakEvenMonths} months
• 5-Year Total Profit: $${financials.projections[4].cumulativeProfit.toLocaleString()}
• 5-Year ROI: ${financials.roi5Year}%

════════════════════════════════════════════════════════════════
Generated on: ${new Date().toLocaleDateString()}
════════════════════════════════════════════════════════════════
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ROI-Executive-Summary-${financials.inputs.students}-students.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="business-case" ref={sectionRef} className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <BarChart3 className={`w-3 h-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t("businessCase.label")}
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("businessCase.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("businessCase.subtitle")}
          </p>
        </div>

        {/* School Size Selector with Editable Inputs */}
        <div className={`mb-12 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Size Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1.5 rounded-2xl bg-muted/50 border shadow-sm">
              {(["small", "medium", "large"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedScenario === key
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Building2 className={`w-4 h-4 inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {schoolLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Input Configuration Card */}
          <Card className="max-w-3xl mx-auto border-2 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                {t("businessCase.configure")} {schoolLabels[selectedScenario]} {t("businessCase.parameters")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="students" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {t("businessCase.students")}
                  </Label>
                  <Input
                    id="students"
                    type="number"
                    min={50}
                    max={2000}
                    value={inputValues.students}
                    onChange={(e) => handleInputChange("students", e.target.value)}
                    onBlur={() => handleInputBlur("students", 50)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">{t("businessCase.enrollment")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buses" className="flex items-center gap-2 text-sm font-medium">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    {t("businessCase.buses")}
                  </Label>
                  <Input
                    id="buses"
                    type="number"
                    min={0}
                    max={50}
                    value={inputValues.buses}
                    onChange={(e) => handleInputChange("buses", e.target.value)}
                    onBlur={() => handleInputBlur("buses", 0)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">{t("businessCase.gpsTracking")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms" className="flex items-center gap-2 text-sm font-medium">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    {t("businessCase.rooms")}
                  </Label>
                  <Input
                    id="rooms"
                    type="number"
                    min={5}
                    max={200}
                    value={inputValues.rooms}
                    onChange={(e) => handleInputChange("rooms", e.target.value)}
                    onBlur={() => handleInputBlur("rooms", 5)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground">{t("businessCase.classroomsOffices")}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("businessCase.subscriptionDaily")}</span>
                  <span className="font-bold text-primary">${financials.tuition.dailySubscription}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("businessCase.totalCostDaily")}</span>
                  <span className="font-bold text-accent">${financials.tuition.dynamicDailyCost}</span>
                </div>
              </div>

              {/* Pricing Assumptions Collapsible */}
              <Collapsible open={showPricingSettings} onOpenChange={setShowPricingSettings} className="mt-4">
                <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Settings2 className="h-4 w-4" />
                  <span>{showPricingSettings ? "Hide" : "Customize"} Pricing Assumptions</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showPricingSettings ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="p-4 rounded-lg bg-muted/30 border space-y-4">
                    <p className="text-xs text-muted-foreground">Adjust the pricing assumptions to match your market conditions:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="annualFee" className="text-xs flex items-center gap-1">
                          Annual Fee/Student
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">The yearly subscription fee charged to parents for the safety tracking service</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="annualFee"
                            type="number"
                            min={50}
                            max={500}
                            value={pricingInputs.annualFeePerStudent}
                            onChange={(e) => handlePricingInputChange("annualFeePerStudent", e.target.value)}
                            onBlur={() => handlePricingInputBlur("annualFeePerStudent", 50)}
                            className="pl-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bracelet" className="text-xs flex items-center gap-1">
                          Bracelet Cost
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">Cost per NFC/RFID bracelet for student tracking</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="bracelet"
                            type="number"
                            min={5}
                            max={50}
                            value={pricingInputs.braceletCost}
                            onChange={(e) => handlePricingInputChange("braceletCost", e.target.value)}
                            onBlur={() => handlePricingInputBlur("braceletCost", 5)}
                            className="pl-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tablet" className="text-xs flex items-center gap-1">
                          Tablet Cost
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">Cost per classroom tablet for attendance scanning</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="tablet"
                            type="number"
                            min={100}
                            max={1000}
                            value={pricingInputs.tabletCost}
                            onChange={(e) => handlePricingInputChange("tabletCost", e.target.value)}
                            onBlur={() => handlePricingInputBlur("tabletCost", 100)}
                            className="pl-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="gps" className="text-xs flex items-center gap-1">
                          GPS Module Cost
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-xs">Cost per GPS tracking module for school buses</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="gps"
                            type="number"
                            min={100}
                            max={500}
                            value={pricingInputs.gpsCost}
                            onChange={(e) => handlePricingInputChange("gpsCost", e.target.value)}
                            onBlur={() => handlePricingInputBlur("gpsCost", 100)}
                            className="pl-7 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* Key Message Banner */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t("businessCase.notCostCenter")}</h3>
                  <p className="text-muted-foreground">{t("businessCase.valueGenerating")}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{t("businessCase.zeroBudget")}</p>
                    <p className="text-sm text-muted-foreground">{t("businessCase.zeroBudgetDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{t("businessCase.predictableRevenue")}</p>
                    <p className="text-sm text-muted-foreground">{t("businessCase.predictableRevenueDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{t("businessCase.strategicData")}</p>
                    <p className="text-sm text-muted-foreground">{t("businessCase.strategicDataDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="investment" className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8 h-auto p-1.5 bg-muted/50">
            <TabsTrigger value="investment" className="py-3 text-xs sm:text-sm">
              <Calculator className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} hidden sm:inline`} />
              {t("businessCase.tabs.investment")}
            </TabsTrigger>
            <TabsTrigger value="projections" className="py-3 text-xs sm:text-sm">
              <LineChart className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} hidden sm:inline`} />
              {t("businessCase.tabs.projections")}
            </TabsTrigger>
            <TabsTrigger value="zero-risk" className="py-3 text-xs sm:text-sm">
              <Shield className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} hidden sm:inline`} />
              {t("businessCase.tabs.zeroRisk")}
            </TabsTrigger>
            <TabsTrigger value="data-value" className="py-3 text-xs sm:text-sm">
              <Database className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} hidden sm:inline`} />
              {t("businessCase.tabs.dataValue")}
            </TabsTrigger>
          </TabsList>

          {/* INVESTMENT BREAKDOWN TAB */}
          <TabsContent value="investment" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Hardware Costs */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    {t("businessCase.hardwareInvestment")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("businessCase.item")}</TableHead>
                        <TableHead className="text-right">{t("businessCase.qty")}</TableHead>
                        <TableHead className="text-right">{t("businessCase.unit")}</TableHead>
                        <TableHead className="text-right">{t("businessCase.total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{t("businessCase.studentBracelets")}</TableCell>
                        <TableCell className="text-right">{financials.hardware.bracelets.qty}</TableCell>
                        <TableCell className="text-right">${financials.hardware.bracelets.unit}</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.bracelets.total.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.classroomTablets")}</TableCell>
                        <TableCell className="text-right">{financials.hardware.tablets.qty}</TableCell>
                        <TableCell className="text-right">${financials.hardware.tablets.unit}</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.tablets.total.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.gpsBusModules")}</TableCell>
                        <TableCell className="text-right">{financials.hardware.gps.qty}</TableCell>
                        <TableCell className="text-right">${financials.hardware.gps.unit}</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.gps.total.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.chargingStations")}</TableCell>
                        <TableCell className="text-right">{financials.hardware.charging.qty}</TableCell>
                        <TableCell className="text-right">${financials.hardware.charging.unit}</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.charging.total.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.serverHardware")}</TableCell>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.server.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.networkEquipment")}</TableCell>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right font-medium">${financials.hardware.network.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="border-t-2 bg-muted/30">
                        <TableCell colSpan={3} className="font-semibold">{t("businessCase.hardwareSubtotal")}</TableCell>
                        <TableCell className="text-right font-bold text-lg">${financials.hardware.total.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Installation & Setup */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-accent" />
                    </div>
                    {t("businessCase.installationSetup")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("businessCase.service")}</TableHead>
                        <TableHead className="text-right">{t("businessCase.cost")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{t("businessCase.installationLabor")}</TableCell>
                        <TableCell className="text-right font-medium">${financials.installation.labor.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.softwareConfiguration")}</TableCell>
                        <TableCell className="text-right font-medium">${financials.installation.software.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.staffTraining")}</TableCell>
                        <TableCell className="text-right font-medium">${financials.installation.training.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>{t("businessCase.projectManagement")}</TableCell>
                        <TableCell className="text-right font-medium">${financials.installation.projectMgmt.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="border-t-2 bg-muted/30">
                        <TableCell className="font-semibold">{t("businessCase.setupSubtotal")}</TableCell>
                        <TableCell className="text-right font-bold text-lg">${financials.installation.total.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{t("businessCase.totalInitialInvestment")}</span>
                      <span className="font-bold text-2xl text-primary">${financials.totalInitialInvestment.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Annual Operating Costs */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-500" />
                  </div>
                  {t("businessCase.annualOperatingCosts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.platformLicense")}</p>
                    <p className="font-bold text-xl">${financials.annual.platform.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.year")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.maintenanceSupport")}</p>
                    <p className="font-bold text-xl">${financials.annual.maintenance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.year")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.estReplacements")}</p>
                    <p className="font-bold text-xl">${financials.annual.replacements.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.year")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.cloudHosting")}</p>
                    <p className="font-bold text-xl">${financials.annual.hosting.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.year")}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl border-2 border-dashed flex justify-between items-center">
                  <span className="font-medium">{t("businessCase.totalAnnualCosts")}</span>
                  <span className="font-bold text-xl">${financials.annual.total.toLocaleString()}{t("businessCase.year")}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5-YEAR PROJECTIONS TAB */}
          <TabsContent value="projections" className="space-y-8">
            {/* Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  {t("businessCase.revenueSources")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.enrolledStudents")}</p>
                    <p className="font-bold text-2xl text-accent">{financials.revenue.enrolledStudents}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.100enrollment")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.annualSubscriptions")}</p>
                    <p className="font-bold text-xl">${financials.revenue.subscriptions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.perStudentYear")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.replacementFees")}</p>
                    <p className="font-bold text-xl">${financials.revenue.replacements.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.annualLossRate")}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl gradient-accent text-white">
                  <span className="font-semibold">{t("businessCase.year1Revenue")}</span>
                  <span className="font-bold text-2xl">${financials.revenue.year1Gross.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* 5-Year Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  {t("businessCase.5yearProjection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("businessCase.yearLabel")}</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t("businessCase.revenue")}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-normal">
                                  <strong>All Years:</strong> Subscriptions (${financials.pricing.annualFeePerStudent}/student) + Replacement fees (3% loss rate)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t("businessCase.costs")}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-normal">
                                  <strong>Year 1:</strong> Initial investment (${financials.totalInitialInvestment.toLocaleString()}) + Annual operating costs (${financials.annual.total.toLocaleString()})<br/>
                                  <strong>Years 2-5:</strong> Annual operating costs only (${financials.annual.total.toLocaleString()}/year)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t("businessCase.netProfit")}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-normal">
                                  Revenue minus Costs for that specific year. Year 1 may be negative due to initial investment.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t("businessCase.cumulative")}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-normal">
                                  Total net profit accumulated from Year 1 through this year. Shows when you recover your investment.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financials.projections.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">{t("businessCase.yearLabel")} {row.year}</TableCell>
                          <TableCell className="text-right text-accent">${row.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">${row.costs.toLocaleString()}</TableCell>
                          <TableCell className={`text-right font-semibold ${row.profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {row.profit >= 0 ? '+' : ''}{row.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${row.cumulativeProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {row.cumulativeProfit >= 0 ? '+' : ''}${row.cumulativeProfit.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TooltipProvider>

                {/* Year 1 Calculation Example */}
                <div className="mt-6 p-5 rounded-xl bg-muted/30 border border-border">
                  <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Year 1 Calculation Example
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Revenue Breakdown */}
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-sm font-semibold text-accent mb-2">Revenue = ${financials.projections[0].revenue.toLocaleString()}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Annual Subscriptions: {financials.revenue.enrolledStudents} students × ${financials.pricing.annualFeePerStudent} = <span className="font-medium text-foreground">${financials.revenue.subscriptions.toLocaleString()}</span></p>
                        <p>• Replacement Fees: ~3% loss rate × $20/replacement = <span className="font-medium text-foreground">${financials.revenue.replacements.toLocaleString()}</span></p>
                      </div>
                    </div>

                    {/* Costs Breakdown */}
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <p className="text-sm font-semibold text-orange-600 mb-2">Costs = ${financials.projections[0].costs.toLocaleString()}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Hardware Costs: <span className="font-medium text-foreground">${financials.hardware.total.toLocaleString()}</span></p>
                        <p>• Installation & Setup: <span className="font-medium text-foreground">${financials.installation.total.toLocaleString()}</span></p>
                        <p>• Annual Operating: Platform (${financials.annual.platform.toLocaleString()}) + Maintenance (${financials.annual.maintenance.toLocaleString()}) + Replacements (${financials.annual.replacements.toLocaleString()}) + Hosting (${financials.annual.hosting.toLocaleString()}) = <span className="font-medium text-foreground">${financials.annual.total.toLocaleString()}</span></p>
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div className={`p-4 rounded-lg ${financials.projections[0].profit >= 0 ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'} border`}>
                      <p className={`text-sm font-semibold mb-2 ${financials.projections[0].profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        Net Profit = Revenue - Costs = ${financials.projections[0].profit >= 0 ? '+' : ''}{financials.projections[0].profit.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${financials.projections[0].revenue.toLocaleString()} - ${financials.projections[0].costs.toLocaleString()} = <span className={`font-medium ${financials.projections[0].profit >= 0 ? 'text-accent' : 'text-destructive'}`}>${financials.projections[0].profit >= 0 ? '+' : ''}{financials.projections[0].profit.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.breakEvenPoint")}</p>
                    <p className="font-bold text-2xl">{financials.breakEvenMonths} {t("businessCase.months")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.5yearTotalProfit")}</p>
                    <p className="font-bold text-2xl text-accent">${financials.projections[4].cumulativeProfit.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.5yearROI")}</p>
                    <p className="font-bold text-2xl text-primary">{financials.roi5Year}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-accent" />
                  {t("businessCase.cumulativeProfitVisualization")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financials.projections.map((row) => {
                    const maxProfit = financials.projections[4].cumulativeProfit;
                    const percentage = (row.cumulativeProfit / maxProfit) * 100;
                    return (
                      <div key={row.year} className="flex items-center gap-4">
                        <span className="w-16 text-sm font-medium">{t("businessCase.yearLabel")} {row.year}</span>
                        <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                          <div 
                            className={`h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700 ${
                              row.cumulativeProfit >= 0 ? 'gradient-accent' : 'bg-destructive'
                            }`}
                            style={{ width: `${Math.max(Math.abs(percentage), 5)}%` }}
                          >
                            <span className="text-white text-sm font-bold">
                              ${row.cumulativeProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ZERO-RISK MODEL TAB */}
          <TabsContent value="zero-risk" className="space-y-8">
            {/* Zero Risk Banner */}
            <Card className="border-2 border-accent overflow-hidden">
              <div className="gradient-accent p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{t("businessCase.zeroRiskTitle")}</h3>
                    <p className="text-white/80">{t("businessCase.zeroRiskSubtitle")}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      {t("businessCase.withoutTuition")}
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-destructive">✗</span>
                        <span>{t("businessCase.schoolAbsorbs")} ${financials.totalInitialInvestment.toLocaleString()} {t("businessCase.upfront")}</span>
                      </li>
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-destructive">✗</span>
                        <span>{t("businessCase.budgetApprovalRequired")}</span>
                      </li>
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-destructive">✗</span>
                        <span>{financials.breakEvenMonths}{t("businessCase.monthBreakEven")}</span>
                      </li>
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-destructive">✗</span>
                        <span>{t("businessCase.financialRisk")}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-accent" />
                      {t("businessCase.withTuition")}
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span>{t("businessCase.schoolInvestsOnly")} ${financials.installation.total.toLocaleString()} {t("businessCase.setupCosts")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span>{t("businessCase.hardwareCostPassed")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span>{t("businessCase.breakEvenInJust")} {financials.tuitionBreakEvenMonths} {t("businessCase.monthsOnly")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span>{t("businessCase.guaranteedPositiveCashFlow")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tuition Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  {t("businessCase.recommendedTuitionFee")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-6 rounded-xl border-2 border-primary/30 bg-primary/5 text-center relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{t("businessCase.recommended")}</Badge>
                    <p className="text-sm text-muted-foreground mb-2 mt-2">{t("businessCase.annualTechFee")}</p>
                    <p className="font-bold text-3xl text-primary">${financials.tuition.techFee}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("businessCase.studentYear")}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("businessCase.includesHardware")} ${financials.tuition.hardwarePerStudent} {t("businessCase.hardwarePlusService")} $125 {t("businessCase.serviceWord")}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("businessCase.dailyCostLabel")}</p>
                    <p className="font-bold text-3xl text-accent">${financials.tuition.dailySubscription}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("businessCase.perDay")}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("businessCase.lessThanCoffee")} ☕
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border bg-accent/5">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    {t("businessCase.parentValueProposition")}
                  </h5>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("businessCase.parentValueDesc")}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      t("businessCase.parentValue1"),
                      t("businessCase.parentValue2"),
                      t("businessCase.parentValue3"),
                      t("businessCase.parentValue4"),
                      t("businessCase.parentValue5"),
                      t("businessCase.parentValue6"),
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tuition Model Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  {t("businessCase.projectionWithTuition")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("businessCase.yearLabel")}</TableHead>
                      <TableHead className="text-right">{t("businessCase.revenue")}</TableHead>
                      <TableHead className="text-right">{t("businessCase.costs")}</TableHead>
                      <TableHead className="text-right">{t("businessCase.netProfit")}</TableHead>
                      <TableHead className="text-right">{t("businessCase.cumulative")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financials.tuitionProjections.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">{t("businessCase.yearLabel")} {row.year}</TableCell>
                        <TableCell className="text-right text-accent">${row.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">${row.costs.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          +${row.profit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-accent">
                          +${row.cumulativeProfit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.schoolInvestment")}</p>
                    <p className="font-bold text-2xl text-accent">${financials.installation.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("businessCase.oneTimeSetup")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t("businessCase.5yearProfit")}</p>
                    <p className="font-bold text-2xl text-accent">${financials.tuitionProjections[4].cumulativeProfit.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl gradient-accent text-white text-center">
                    <p className="text-sm text-white/80 mb-1">{t("businessCase.5yearROI")}</p>
                    <p className="font-bold text-2xl">{financials.tuitionRoi5Year}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Simplification */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t("businessCase.whyBoardApprovalEasy")}</h4>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.noLargeCapital")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.predictableRevenueStream")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.positiveROIFromMonth1")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.enhancedSafety")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.competitiveAdvantage")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm text-muted-foreground">{t("businessCase.noUncertainROI")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATA & ANALYTICS TAB */}
          <TabsContent value="data-value" className="space-y-8">
            {/* Strategic Data Asset Banner */}
            <Card className="border-2 border-primary overflow-hidden">
              <div className="gradient-hero p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Brain className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{t("businessCase.strategicDataAsset")}</h3>
                    <p className="text-white/80">{t("businessCase.insightsSubtitle")}</p>
                  </div>
                </div>
                <p className="text-white/90 max-w-3xl">
                  {t("businessCase.strategicDataFullDesc")}
                </p>
              </div>
            </Card>

            {/* Data Categories */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    {t("businessCase.studentAttendanceData")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t("businessCase.data.attendancePatterns"),
                    t("businessCase.data.absencePrediction"),
                    t("businessCase.data.chronicAbsenteeism"),
                    t("businessCase.data.arrivalDeparture"),
                    t("businessCase.data.classEngagement"),
                    t("businessCase.data.historicalRecords"),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    {t("businessCase.operationalAnalytics")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t("businessCase.data.busRoute"),
                    t("businessCase.data.peakTraffic"),
                    t("businessCase.data.classroomUtilization"),
                    t("businessCase.data.staffEfficiency"),
                    t("businessCase.data.resourceAllocation"),
                    t("businessCase.data.emergencyResponse"),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    {t("businessCase.performanceOutcomes")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t("businessCase.data.attendanceGrade"),
                    t("businessCase.data.engagementScoring"),
                    t("businessCase.data.retentionRisk"),
                    t("businessCase.data.academicTrends"),
                    t("businessCase.data.behaviorPatterns"),
                    t("businessCase.data.learningPredictions"),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-purple-500" />
                    {t("businessCase.reportingCompliance")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t("businessCase.data.governmentReports"),
                    t("businessCase.data.accreditation"),
                    t("businessCase.data.parentComms"),
                    t("businessCase.data.safetyIncident"),
                    t("businessCase.data.auditReady"),
                    t("businessCase.data.customReports"),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Strategic Advantages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {t("businessCase.strategicAdvantages")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h5 className="font-bold mb-2">{t("businessCase.improvePerformance")}</h5>
                    <p className="text-sm text-muted-foreground">
                      {t("businessCase.improvePerformanceDesc")}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <h5 className="font-bold mb-2">{t("businessCase.boostRetention")}</h5>
                    <p className="text-sm text-muted-foreground">
                      {t("businessCase.boostRetentionDesc")}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-orange-500" />
                    </div>
                    <h5 className="font-bold mb-2">{t("businessCase.enhanceReputation")}</h5>
                    <p className="text-sm text-muted-foreground">
                      {t("businessCase.enhanceReputationDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Ownership Note */}
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-bold mb-2">{t("businessCase.dataOwnership")}</h5>
                    <p className="text-sm text-muted-foreground">
                      {t("businessCase.dataOwnershipDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Final CTA */}
        <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="max-w-3xl mx-auto overflow-hidden">
            <div className="gradient-hero p-10 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">{t("businessCase.readyToPresent")}</h3>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                {t("businessCase.downloadDesc")}
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={handleDownloadPackage}
                  className="px-8 py-4 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {t("businessCase.downloadPackage")}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
