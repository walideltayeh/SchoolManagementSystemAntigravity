import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users,
  Clock,
  Percent,
  GraduationCap,
  Laptop,
  Watch,
  CheckCircle2,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export function ROICalculator() {
  const [students, setStudents] = useState(300);
  const [adoptionRate, setAdoptionRate] = useState(85);
  const [addToTuition, setAddToTuition] = useState(true);

  const calculations = useMemo(() => {
    // Hardware costs breakdown
    const braceletCost = 15; // per unit
    const braceletQuantity = Math.ceil(students * 1.1); // 10% buffer
    const totalBraceletCost = braceletCost * braceletQuantity;
    
    const tabletCost = 300; // per unit
    const tabletQuantity = 70; // classroom terminals
    const totalTabletCost = tabletCost * tabletQuantity;
    
    const gpsModuleCost = 250; // per bus
    const busCount = 5;
    const totalGPSCost = gpsModuleCost * busCount;
    
    const chargingStationCost = 500;
    const chargingStationQuantity = 5;
    const totalChargingCost = chargingStationCost * chargingStationQuantity;
    
    const softwareLicenseCost = 2000; // annual platform fee
    const implementationCost = 3000; // one-time setup
    
    const totalHardwareCost = totalBraceletCost + totalTabletCost + totalGPSCost + totalChargingCost;
    const totalInitialInvestment = totalHardwareCost + implementationCost;
    
    // Revenue per student
    const annualFeePerStudent = 125;
    const depositPerStudent = 25; // refundable
    const braceletReplacementFee = 15; // lost/damaged
    const estimatedReplacementRate = 0.05; // 5% yearly
    
    const adoptedStudents = Math.floor((students * adoptionRate) / 100);
    
    // Annual revenues
    const subscriptionRevenue = adoptedStudents * annualFeePerStudent;
    const depositRevenue = adoptedStudents * depositPerStudent; // first year only
    const replacementRevenue = Math.floor(adoptedStudents * estimatedReplacementRate) * braceletReplacementFee;
    
    const year1Revenue = subscriptionRevenue + depositRevenue + replacementRevenue;
    const recurringAnnualRevenue = subscriptionRevenue + replacementRevenue;
    
    // Tuition integration calculations
    const tuitionAddOn = addToTuition ? annualFeePerStudent + (totalHardwareCost / students) : 0;
    const tuitionBraceletFee = braceletCost + 5; // $5 handling fee
    const totalTuitionAddOn = addToTuition ? tuitionAddOn : 0;
    
    // If added to tuition, school covers hardware cost and gets full revenue
    const schoolNetCostWithTuition = addToTuition ? 0 : totalInitialInvestment;
    const effectiveInvestment = addToTuition ? implementationCost : totalInitialInvestment;
    
    // Break-even calculation
    const monthlyRevenue = recurringAnnualRevenue / 12;
    const breakEvenMonths = effectiveInvestment > 0 ? Math.ceil(effectiveInvestment / monthlyRevenue) : 0;
    
    // Profit calculations
    const year1Profit = year1Revenue - (addToTuition ? softwareLicenseCost : totalInitialInvestment + softwareLicenseCost);
    const year2To5AnnualProfit = recurringAnnualRevenue - softwareLicenseCost;
    const year5TotalProfit = year1Profit + (year2To5AnnualProfit * 4);
    
    const roiPercent = effectiveInvestment > 0 
      ? Math.round((year1Profit / effectiveInvestment) * 100)
      : Infinity;
    
    const dailyCostPerStudent = (annualFeePerStudent / 180).toFixed(2);

    // Per-student hardware cost for tuition
    const hardwareCostPerStudent = Math.ceil(totalHardwareCost / students);

    return {
      // Hardware breakdown
      totalBraceletCost,
      braceletQuantity,
      totalTabletCost,
      tabletQuantity,
      totalGPSCost,
      busCount,
      totalChargingCost,
      totalHardwareCost,
      softwareLicenseCost,
      implementationCost,
      totalInitialInvestment,
      
      // Per student
      annualFeePerStudent,
      depositPerStudent,
      hardwareCostPerStudent,
      tuitionAddOn: Math.ceil(totalTuitionAddOn),
      tuitionBraceletFee,
      
      // Revenue
      adoptedStudents,
      subscriptionRevenue,
      depositRevenue,
      replacementRevenue,
      year1Revenue,
      recurringAnnualRevenue,
      
      // ROI
      effectiveInvestment,
      breakEvenMonths,
      year1Profit,
      year2To5AnnualProfit,
      year5TotalProfit,
      roiPercent,
      dailyCostPerStudent,
    };
  }, [students, adoptionRate, addToTuition]);

  return (
    <section id="roi" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Financial Projections</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Detailed ROI Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See exactly how the investment breaks down and how adding fees to tuition 
            makes implementation virtually cost-free for your school.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Calculator Controls - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Configure Your School</h3>
                    <p className="text-sm text-muted-foreground">Adjust to match your needs</p>
                  </div>
                </div>

                {/* Students Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Student Enrollment
                    </label>
                    <span className="font-display text-xl font-bold text-primary">{students}</span>
                  </div>
                  <Slider
                    value={[students]}
                    onValueChange={([val]) => setStudents(val)}
                    min={100}
                    max={1000}
                    step={25}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100</span>
                    <span>500</span>
                    <span>1,000</span>
                  </div>
                </div>

                {/* Adoption Rate Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      Expected Adoption Rate
                    </label>
                    <span className="font-display text-xl font-bold text-accent">{adoptionRate}%</span>
                  </div>
                  <Slider
                    value={[adoptionRate]}
                    onValueChange={([val]) => setAdoptionRate(val)}
                    min={50}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                </div>

                {/* Tuition Integration Toggle */}
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span className="font-medium">Add to Tuition</span>
                    </div>
                    <Switch 
                      checked={addToTuition} 
                      onCheckedChange={setAddToTuition}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {addToTuition 
                      ? "✓ Hardware costs passed to parents. Near-zero school investment!"
                      : "School absorbs all upfront hardware costs."}
                  </p>
                </div>

                {/* Daily Cost Highlight */}
                <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Cost per student per day</p>
                  <p className="font-display text-3xl font-bold text-accent">
                    ${calculations.dailyCostPerStudent}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Less than a cup of coffee ☕</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results - Right Side */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="hardware">Hardware Costs</TabsTrigger>
                <TabsTrigger value="tuition">Tuition Strategy</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Enrolled Students</span>
                      </div>
                      <p className="font-display text-2xl font-bold">{calculations.adoptedStudents}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Year 1 Revenue</span>
                      </div>
                      <p className="font-display text-2xl font-bold text-accent">
                        ${calculations.year1Revenue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Break-Even</span>
                      </div>
                      <p className="font-display text-2xl font-bold">
                        {calculations.breakEvenMonths === 0 ? (
                          <span className="text-accent">Instant!</span>
                        ) : (
                          <>{calculations.breakEvenMonths} <span className="text-base">mo</span></>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Year 1 ROI</span>
                      </div>
                      <p className="font-display text-2xl font-bold text-primary">
                        {calculations.roiPercent === Infinity ? "∞" : `${calculations.roiPercent}%`}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment vs Revenue */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-display font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Investment vs. Revenue
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">Initial Investment</span>
                        <span className="font-bold text-lg">
                          {addToTuition ? (
                            <span className="line-through text-muted-foreground">
                              ${calculations.totalInitialInvestment.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-destructive">-${calculations.totalInitialInvestment.toLocaleString()}</span>
                          )}
                        </span>
                      </div>
                      {addToTuition && (
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-muted-foreground">Effective School Cost</span>
                          <span className="font-bold text-lg text-accent">
                            ${calculations.implementationCost.toLocaleString()}
                            <span className="text-xs text-muted-foreground ml-1">(setup only)</span>
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">Year 1 Revenue</span>
                        <span className="font-bold text-lg text-accent">+${calculations.year1Revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">Annual Platform Fee</span>
                        <span className="font-bold">-${calculations.softwareLicenseCost.toLocaleString()}/yr</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold">Year 1 Net Profit</span>
                        <span className={`font-display text-2xl font-bold ${calculations.year1Profit > 0 ? 'text-accent' : 'text-destructive'}`}>
                          {calculations.year1Profit > 0 ? '+' : ''}${calculations.year1Profit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 5-Year Projection */}
                <Card className="overflow-hidden">
                  <div className="gradient-accent p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 mb-1">5-Year Total Profit</p>
                        <p className="font-display text-3xl font-bold">
                          ${calculations.year5TotalProfit.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((year) => {
                        const yearProfit = year === 1 
                          ? calculations.year1Profit 
                          : calculations.year1Profit + (calculations.year2To5AnnualProfit * (year - 1));
                        return (
                          <div key={year} className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">Year {year} Cumulative</span>
                            <span className={`font-semibold ${yearProfit > 0 ? "text-accent" : "text-destructive"}`}>
                              {yearProfit > 0 ? "+" : ""}${yearProfit.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hardware Costs Tab */}
              <TabsContent value="hardware" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-display font-bold mb-6 flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-primary" />
                      Hardware Investment Breakdown
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Watch className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Student Bracelets</p>
                            <p className="text-xs text-muted-foreground">{calculations.braceletQuantity} units × $15</p>
                          </div>
                        </div>
                        <span className="font-bold">${calculations.totalBraceletCost.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Laptop className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Classroom Tablets</p>
                            <p className="text-xs text-muted-foreground">{calculations.tabletQuantity} units × $300</p>
                          </div>
                        </div>
                        <span className="font-bold">${calculations.totalTabletCost.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <div>
                            <p className="font-medium">GPS Bus Modules</p>
                            <p className="text-xs text-muted-foreground">{calculations.busCount} buses × $250</p>
                          </div>
                        </div>
                        <span className="font-bold">${calculations.totalGPSCost.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <div>
                            <p className="font-medium">Charging Stations</p>
                            <p className="text-xs text-muted-foreground">5 stations × $500</p>
                          </div>
                        </div>
                        <span className="font-bold">${calculations.totalChargingCost.toLocaleString()}</span>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-muted-foreground">Hardware Subtotal</span>
                          <span className="font-bold">${calculations.totalHardwareCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-muted-foreground">Implementation & Setup</span>
                          <span className="font-bold">${calculations.implementationCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-semibold">Total Initial Investment</span>
                          <span className="font-display text-xl font-bold text-primary">
                            ${calculations.totalInitialInvestment.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Cost Per Student</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          When divided across your student body, the hardware investment equals just 
                          <span className="font-bold text-primary"> ${calculations.hardwareCostPerStudent}</span> per student.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This can easily be added to tuition or charged as a one-time technology fee.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tuition Strategy Tab */}
              <TabsContent value="tuition" className="space-y-6">
                <Card className="border-2 border-accent/30 bg-accent/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold">The Smart Approach: Add to Tuition</h4>
                        <p className="text-sm text-muted-foreground">Eliminate upfront costs entirely</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      By incorporating the system costs into tuition fees, your school makes a 
                      <span className="font-semibold text-foreground"> zero-risk investment</span> while 
                      providing parents with enhanced safety and convenience.
                    </p>

                    <div className="bg-background rounded-xl p-5 space-y-4">
                      <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Suggested Tuition Add-Ons
                      </h5>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Annual Safety Technology Fee</p>
                          <p className="text-xs text-muted-foreground">Covers system access + hardware share</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-bold text-accent">
                            ${calculations.annualFeePerStudent + calculations.hardwareCostPerStudent}
                          </p>
                          <p className="text-xs text-muted-foreground">/student/year</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">One-Time Bracelet Fee</p>
                          <p className="text-xs text-muted-foreground">Refundable upon graduation</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-bold">${calculations.depositPerStudent}</p>
                          <p className="text-xs text-muted-foreground">deposit</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                        <div>
                          <p className="font-medium">Lost/Damaged Bracelet</p>
                          <p className="text-xs text-muted-foreground">Replacement fee (revenue for school)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-bold">$20</p>
                          <p className="text-xs text-muted-foreground">each</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-display font-bold mb-4">Parent Value Proposition</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      When presenting to parents, frame the fee as invaluable peace of mind:
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "Real-time notifications when your child arrives at school",
                        "Live GPS tracking of school buses",
                        "Instant alerts for attendance issues",
                        "Direct communication with teachers",
                        "Emergency location services",
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground mb-1">All this for just</p>
                      <p className="font-display text-3xl font-bold text-primary">
                        $0.{Math.floor((calculations.annualFeePerStudent / 180) * 100)}/day
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Less than a cup of coffee ☕</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="gradient-hero p-6 text-white">
                    <h4 className="font-display font-bold text-lg mb-2">The Bottom Line</h4>
                    <p className="text-white/80 text-sm mb-4">
                      With the tuition integration strategy, here's what your school gains:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-xs mb-1">School Investment</p>
                        <p className="font-display text-2xl font-bold">
                          ${calculations.implementationCost.toLocaleString()}
                        </p>
                        <p className="text-white/60 text-xs">One-time setup</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-xs mb-1">Annual Profit</p>
                        <p className="font-display text-2xl font-bold">
                          ${(calculations.recurringAnnualRevenue - calculations.softwareLicenseCost).toLocaleString()}
                        </p>
                        <p className="text-white/60 text-xs">After platform fee</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-accent" />
                      <span>
                        Your school recoups the setup cost in 
                        <span className="font-bold text-primary"> {calculations.breakEvenMonths === 0 ? "under 1" : calculations.breakEvenMonths} month{calculations.breakEvenMonths !== 1 ? "s" : ""}</span>, 
                        then generates 
                        <span className="font-bold text-accent"> ${calculations.year5TotalProfit.toLocaleString()} </span> 
                        in profit over 5 years.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
