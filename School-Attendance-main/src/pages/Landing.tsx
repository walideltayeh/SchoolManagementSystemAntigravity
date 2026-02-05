import { Link } from "react-router-dom";
import { QrCode, ShieldCheck, Zap, BarChart3, Users, Smartphone, Bell, CheckCircle2, Clock, Globe, ArrowUpRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import { LiquidGlassButton } from "@/components/ui/LiquidGlassButton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CountUp } from "@/components/CountUp";
import { cn } from "@/lib/utils";

// Animated Section Wrapper
function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, isVisible } = useScrollAnimation();
    return (
        <section
            ref={ref}
            className={cn(
                "transition-all duration-700 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </section>
    );
}

// Animated Item for staggered animations
function AnimatedItem({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, isVisible } = useScrollAnimation();
    return (
        <div
            ref={ref}
            className={cn(
                "transition-all duration-500 ease-out",
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

const FEATURES = [
    {
        icon: QrCode,
        title: "Instant QR Scanning",
        description: "Students scan their unique QR code in under a second. No cards, no queues.",
    },
    {
        icon: Bell,
        title: "Real-time Parent Alerts",
        description: "Parents receive instant notifications when their child checks in or out.",
    },
    {
        icon: BarChart3,
        title: "Powerful Analytics",
        description: "Comprehensive dashboards to track attendance patterns and trends.",
    },
    {
        icon: ShieldCheck,
        title: "Enterprise Security",
        description: "Bank-grade encryption and full data privacy compliance.",
    },
    {
        icon: Smartphone,
        title: "Works Everywhere",
        description: "Access from any device. No app installation needed.",
    },
    {
        icon: Users,
        title: "Easy Management",
        description: "Manage students, teachers, and classes from one platform.",
    },
];

const STATS = [
    { value: 50, suffix: "+", label: "Schools" },
    { value: 25, suffix: "K+", label: "Students" },
    { value: 99.9, suffix: "%", label: "Uptime" },
    { value: 1, prefix: "<", suffix: "s", label: "Scan Time" },
];

const STEPS = [
    { icon: QrCode, title: "Scan", description: "Student scans their unique QR code at the entrance.", number: "01" },
    { icon: CheckCircle2, title: "Record", description: "Attendance is instantly recorded with timestamp.", number: "02" },
    { icon: Bell, title: "Notify", description: "Parents receive real-time alerts on their phone.", number: "03" },
    { icon: BarChart3, title: "Analyze", description: "Admins view detailed reports and analytics.", number: "04" },
];

export default function Landing() {
    const { schoolInfo } = useSchoolConfig();
    const [demoOpen, setDemoOpen] = useState(false);

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDemoOpen(false);
        toast.success("Demo request sent! We'll contact you shortly.");
    };

    return (
        <div className="min-h-screen w-full bg-black text-white font-sans antialiased overflow-x-hidden">

            {/* Pure black background with subtle grid */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xl tracking-tight text-white">{schoolInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/auth">
                            <LiquidGlassButton variant="secondary" className="h-10 px-6 text-sm">
                                Admin
                            </LiquidGlassButton>
                        </Link>
                        <Link to="/parent-login">
                            <LiquidGlassButton variant="primary" className="h-10 px-6 text-sm">
                                Parent Portal
                            </LiquidGlassButton>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center px-6">
                <div className="animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm text-gray-300 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Now with AI-powered insights</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] max-w-5xl">
                        School Attendance
                        <br />
                        <span className="text-red-500">
                            Reinvented.
                        </span>
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        The modern way to track attendance. Seamless QR check-ins, instant parent alerts, and powerful analytics — all in one platform.
                    </p>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-200">
                    <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                        <DialogTrigger asChild>
                            <LiquidGlassButton variant="primary" size="lg">
                                Book a Demo
                            </LiquidGlassButton>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-black border border-white/10 shadow-2xl rounded-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-white">Book a Demo</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Schedule a personalized tour.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleDemoSubmit} className="space-y-4 mt-4">
                                <div className="space-y-1.5">
                                    <Label className="text-gray-300 font-medium text-sm">Email</Label>
                                    <Input type="email" placeholder="principal@school.edu" required className="h-11 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-gray-300 font-medium text-sm">School Name</Label>
                                    <Input placeholder="Greenwood High" required className="h-11 rounded-lg bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <LiquidGlassButton type="button" variant="secondary" onClick={() => setDemoOpen(false)} className="h-10 px-5">Cancel</LiquidGlassButton>
                                    <LiquidGlassButton type="submit" variant="primary" className="h-10 px-5">Submit</LiquidGlassButton>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Link to="/parent-login">
                        <LiquidGlassButton variant="secondary" size="lg">
                            Try Parent Portal
                        </LiquidGlassButton>
                    </Link>
                </div>

                {/* Floating badges */}
                <div className="mt-16 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-300">
                    {["Lightning Fast", "Secure", "Mobile Ready", "Cloud Based"].map((badge, i) => (
                        <div key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 backdrop-blur-sm">
                            {badge}
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section with Animated Counters */}
            <AnimatedSection className="py-20 border-y border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((stat, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-colors">
                                <div className="text-4xl md:text-5xl font-bold text-red-500">
                                    <CountUp
                                        end={stat.value}
                                        prefix={stat.prefix || ""}
                                        suffix={stat.suffix || ""}
                                        duration={2000}
                                    />
                                </div>
                                <div className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* How It Works Section */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-20">
                        <span className="text-red-500 font-semibold text-sm uppercase tracking-wider">Process</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4 mb-6">
                            How It Works
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-lg">
                            A simple four-step process that takes less than a second.
                        </p>
                    </AnimatedSection>

                    <div className="relative">
                        {/* Connecting line for desktop - centered on circles */}
                        <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-[2px] bg-red-500/30 z-0">
                            <div className="absolute inset-0 bg-red-500 animate-pulse opacity-30" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {STEPS.map((step, i) => (
                                <AnimatedItem key={i} delay={i * 300}>
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Step number circle */}
                                        <div className="relative z-10 w-20 h-20 rounded-full bg-black border-2 border-red-500/30 flex items-center justify-center mb-6 group hover:border-red-500 transition-colors">
                                            <span className="text-2xl font-bold text-red-500">
                                                {step.number}
                                            </span>
                                            {/* Pulse ring animation */}
                                            <div
                                                className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping"
                                                style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2s' }}
                                            />
                                        </div>

                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
                                            <step.icon className="w-7 h-7 text-red-500" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="font-bold text-white text-xl mb-3">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">{step.description}</p>

                                        {/* Arrow for mobile */}
                                        {i < STEPS.length - 1 && (
                                            <div className="mt-6 lg:hidden">
                                                <div className="w-px h-8 bg-red-500/30 mx-auto" />
                                                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500/50 mx-auto" />
                                            </div>
                                        )}
                                    </div>
                                </AnimatedItem>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <AnimatedSection className="py-24 md:py-32 px-6 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-red-500 font-semibold text-sm uppercase tracking-wider">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4 mb-6">
                            Everything You Need
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-lg">
                            A complete solution designed for modern schools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature, i) => (
                            <AnimatedItem key={i} delay={i * 100}>
                                <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all duration-300 h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-7 h-7 text-red-500" />
                                    </div>
                                    <h3 className="font-bold text-white text-xl mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </AnimatedItem>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Benefits Section */}
            <AnimatedSection className="py-24 md:py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-red-500 font-semibold text-sm uppercase tracking-wider">Benefits</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4 mb-6">
                            Why Schools Love Us
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <AnimatedItem delay={0}>
                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-colors">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-7 h-7 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl mb-2">Save Hours Every Week</h4>
                                    <p className="text-gray-500 leading-relaxed">Eliminate manual attendance taking completely. Teachers can focus on what matters most — teaching.</p>
                                </div>
                            </div>
                        </AnimatedItem>
                        <AnimatedItem delay={150}>
                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-colors">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-7 h-7 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl mb-2">Access Anywhere</h4>
                                    <p className="text-gray-500 leading-relaxed">Cloud-based platform accessible from any device, anywhere in the world. No installation required.</p>
                                </div>
                            </div>
                        </AnimatedItem>
                        <AnimatedItem delay={300}>
                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-colors">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-7 h-7 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl mb-2">Instant Setup</h4>
                                    <p className="text-gray-500 leading-relaxed">Get started in minutes, not weeks. No complex installation or lengthy training sessions needed.</p>
                                </div>
                            </div>
                        </AnimatedItem>
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA Section */}
            <AnimatedSection className="py-24 md:py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                            Ready to Transform Attendance?
                        </h2>
                        <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
                            Join the schools already using our platform to save time and keep parents informed.
                        </p>
                        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                            <DialogTrigger asChild>
                                <LiquidGlassButton variant="primary" size="lg">
                                    Get Started Today
                                </LiquidGlassButton>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>
            </AnimatedSection>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{schoolInfo.name}</span>
                    </div>
                    <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                    <div className="flex items-center gap-6">
                        <Link to="/auth" className="hover:text-red-500 transition-colors">Admin Login</Link>
                        <Link to="/parent-login" className="hover:text-red-500 transition-colors">Parent Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
