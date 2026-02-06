import { Link } from "react-router-dom";
import { QrCode, Bell, BarChart3 } from "lucide-react";
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
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import { LiquidGlassButton } from "@/components/ui/LiquidGlassButton";
import { cn } from "@/lib/utils";

// Scroll-triggered fade-in animation hook
function useScrollFade() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

// Animated section component
function FadeSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, isVisible } = useScrollFade();
    return (
        <div
            ref={ref}
            className={cn(
                "transition-all duration-700 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// Core features - simplified to 3
const FEATURES = [
    {
        icon: QrCode,
        title: "Instant Check-in",
        description: "Students scan their QR code in under a second.",
    },
    {
        icon: Bell,
        title: "Real-time Alerts",
        description: "Parents know the moment their child arrives.",
    },
    {
        icon: BarChart3,
        title: "Clear Insights",
        description: "Track attendance patterns at a glance.",
    },
];

export default function Landing() {
    const { schoolInfo } = useSchoolConfig();
    const [demoOpen, setDemoOpen] = useState(false);

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDemoOpen(false);
        toast.success("We'll be in touch shortly.");
    };

    return (
        <div className="min-h-screen w-full bg-white text-[#1d1d1f] font-sans antialiased overflow-x-hidden">

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/50">
                <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
                    <span className="font-semibold text-[#1d1d1f] tracking-tight">
                        {schoolInfo.name}
                    </span>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/auth"
                            className="text-sm text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                        >
                            Admin
                        </Link>
                        <Link to="/parent-login">
                            <LiquidGlassButton variant="primary" size="sm">
                                Parent Portal
                            </LiquidGlassButton>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-[48px] md:text-[64px] lg:text-[80px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#1d1d1f] animate-fade-in"
                        style={{ textWrap: "balance" } as React.CSSProperties}
                    >
                        School attendance.
                        <br />
                        <span className="text-[#86868b]">Simplified.</span>
                    </h1>

                    <p className="mt-6 text-[19px] md:text-[21px] text-[#86868b] max-w-xl mx-auto leading-relaxed animate-fade-in animation-delay-100">
                        QR check-ins. Instant parent alerts. Beautiful analytics.
                        <br className="hidden md:block" />
                        All in one platform.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-200">
                        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                            <DialogTrigger asChild>
                                <LiquidGlassButton variant="primary" size="lg">
                                    Get started
                                </LiquidGlassButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white border border-[#d2d2d7] shadow-2xl rounded-2xl p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-semibold text-[#1d1d1f]">
                                        Get started
                                    </DialogTitle>
                                    <DialogDescription className="text-[#86868b] mt-1">
                                        We'll reach out to schedule a demo.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleDemoSubmit} className="space-y-5 mt-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#1d1d1f] font-medium text-sm">Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="you@school.edu"
                                            required
                                            className="h-12 rounded-xl bg-[#f5f5f7] border-transparent text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[#1d1d1f] font-medium text-sm">School Name</Label>
                                        <Input
                                            placeholder="Your School"
                                            required
                                            className="h-12 rounded-xl bg-[#f5f5f7] border-transparent text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <LiquidGlassButton
                                            type="button"
                                            variant="light-secondary"
                                            onClick={() => setDemoOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </LiquidGlassButton>
                                        <LiquidGlassButton
                                            type="submit"
                                            variant="primary"
                                            className="flex-1"
                                        >
                                            Submit
                                        </LiquidGlassButton>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Link to="/how-it-works">
                            <LiquidGlassButton variant="light-secondary" size="lg">
                                See how it works
                            </LiquidGlassButton>
                        </Link>
                    </div>
                </div>
            </section >

            {/* Divider */}
            < div className="max-w-5xl mx-auto px-6" >
                <div className="h-px bg-gradient-to-r from-transparent via-[#d2d2d7] to-transparent" />
            </div >

            {/* Features Section */}
            < section className="py-24 md:py-32 px-6" >
                <div className="max-w-4xl mx-auto">
                    <FadeSection className="text-center mb-16">
                        <h2 className="text-[40px] md:text-[48px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                            Everything you need.
                        </h2>
                        <p className="mt-4 text-[19px] text-[#86868b]">
                            Nothing you don't.
                        </p>
                    </FadeSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {FEATURES.map((feature, i) => (
                            <FadeSection key={i} delay={i * 100}>
                                <div className="text-center p-8 rounded-2xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors duration-300">
                                    <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                        <feature.icon className="w-7 h-7 text-[#0071e3]" />
                                    </div>
                                    <h3 className="font-semibold text-xl text-[#1d1d1f] mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#86868b] text-base leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </div>
            </section >

            {/* Value Proposition Section */}
            < section className="py-24 md:py-32 px-6 bg-[#f5f5f7]" >
                <div className="max-w-3xl mx-auto text-center">
                    <FadeSection>
                        <h2 className="text-[40px] md:text-[48px] font-semibold tracking-[-0.03em] text-[#1d1d1f] leading-tight">
                            Save hours every week.
                            <br />
                            <span className="text-[#86868b]">Keep everyone informed.</span>
                        </h2>
                        <p className="mt-6 text-[19px] text-[#86868b] max-w-xl mx-auto leading-relaxed">
                            No more paper sign-in sheets. No more manual data entry.
                            Teachers focus on teaching. Parents stay in the loop.
                        </p>
                    </FadeSection>
                </div>
            </section >

            {/* Stats Section */}
            < section className="py-24 md:py-32 px-6" >
                <div className="max-w-4xl mx-auto">
                    <FadeSection>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-[48px] md:text-[56px] font-semibold tracking-tight text-[#1d1d1f]">50+</div>
                                <div className="text-[15px] text-[#86868b] mt-1">Schools</div>
                            </div>
                            <div>
                                <div className="text-[48px] md:text-[56px] font-semibold tracking-tight text-[#1d1d1f]">25K</div>
                                <div className="text-[15px] text-[#86868b] mt-1">Students</div>
                            </div>
                            <div>
                                <div className="text-[48px] md:text-[56px] font-semibold tracking-tight text-[#1d1d1f]">99.9%</div>
                                <div className="text-[15px] text-[#86868b] mt-1">Uptime</div>
                            </div>
                            <div>
                                <div className="text-[48px] md:text-[56px] font-semibold tracking-tight text-[#1d1d1f]">&lt;1s</div>
                                <div className="text-[15px] text-[#86868b] mt-1">Check-in</div>
                            </div>
                        </div>
                    </FadeSection>
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-24 md:py-32 px-6 bg-[#1d1d1f]" >
                <div className="max-w-3xl mx-auto text-center">
                    <FadeSection>
                        <h2 className="text-[40px] md:text-[48px] font-semibold tracking-[-0.03em] text-white">
                            Ready to get started?
                        </h2>
                        <p className="mt-4 text-[19px] text-[#86868b] max-w-lg mx-auto">
                            Join the schools already transforming their attendance.
                        </p>
                        <div className="mt-10">
                            <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                                <DialogTrigger asChild>
                                    <LiquidGlassButton variant="primary" size="lg">
                                        Get started
                                    </LiquidGlassButton>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    </FadeSection>
                </div>
            </section >

            {/* Footer */}
            < footer className="py-8 px-6 border-t border-[#d2d2d7]" >
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#86868b]">
                    <span>© {new Date().getFullYear()} {schoolInfo.name}</span>
                    <div className="flex items-center gap-6">
                        <Link to="/auth" className="hover:text-[#1d1d1f] transition-colors">
                            Admin
                        </Link>
                        <Link to="/parent-login" className="hover:text-[#1d1d1f] transition-colors">
                            Parent Portal
                        </Link>
                    </div>
                </div>
            </footer >
        </div >
    );
}
