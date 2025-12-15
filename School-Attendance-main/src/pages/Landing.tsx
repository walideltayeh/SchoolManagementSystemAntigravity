import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Globe, ShieldCheck, Smartphone, Zap } from "lucide-react";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SLIDES = [
    {
        id: "scan",
        title: "Seamless Entry",
        subtitle: "Students simply scan their unique QR code. Our advanced technology marks attendance instantly—secure, fast, and reliable.",
        gradient: "from-blue-400 via-purple-400 to-pink-400",
        icon: Zap,
        image: "/device_scanning.png",
        imageAlt: "Student scanning QR code on tablet"
    },
    {
        id: "process",
        title: "Real-time Sync",
        subtitle: "The moment attendance is marked, data syncs securely. Parents receive instant notifications via the mobile app.",
        gradient: "from-green-400 via-emerald-400 to-teal-400",
        icon: Smartphone,
        image: "/process_flow.png",
        imageAlt: "Process flow showing notification system"
    },
    {
        id: "global",
        title: "Global Citizens",
        subtitle: "Nurturing inquiring, knowledgeable and caring young people for a better world through our IB curriculum.",
        gradient: "from-orange-400 via-amber-400 to-yellow-400",
        icon: Globe,
        image: null, // Abstract fallback
        imageAlt: "Global connections"
    }
];

export default function Landing() {
    const [demoOpen, setDemoOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000); // 6 seconds for better reading time
        return () => clearInterval(timer);
    }, []);

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDemoOpen(false);
        toast.success("Demo request sent! We'll contact you shortly.");
    };

    return (
        <div className="h-screen w-screen bg-zinc-950 text-white overflow-hidden flex font-sans selection:bg-purple-500/30">
            {/* LEFT COLUMN: Content */}
            <div className="w-full lg:w-1/2 h-full flex flex-col relative z-20 bg-zinc-950/80 backdrop-blur-md lg:bg-zinc-950">
                {/* Navigation */}
                <nav className="p-6 md:p-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-purple-900/20">
                            <span className="font-bold text-xl text-white">T</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">Test School</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <Link to="/auth" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Staff Login</Link>
                        <Link to="/parent-login">
                            <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/10 hover:text-white transition-all">
                                Parent Portal
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 relative">
                    {SLIDES.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-20 transition-all duration-1000 ease-in-out ${index === currentSlide
                                    ? "opacity-100 translate-x-0 pointer-events-auto"
                                    : "opacity-0 -translate-x-8 pointer-events-none"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${slide.gradient} bg-opacity-10 opacity-80`}>
                                    <slide.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Feature Highlight</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                                <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                                    {slide.title}
                                </span>
                            </h1>

                            <p className="text-xl text-gray-400 max-w-lg mb-10 leading-relaxed">
                                {slide.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/parent-login">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-all w-full sm:w-auto">
                                        Parent Portal <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto">
                                            Request Demo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">Request a Demo</DialogTitle>
                                            <DialogDescription className="text-gray-400">
                                                Enter your details below to schedule a personalized walkthrough.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleDemoSubmit} className="space-y-6 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-300">Email address</Label>
                                                <Input id="email" type="email" placeholder="name@school.com" required className="bg-zinc-900 border-white/10 text-white focus:border-purple-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="school" className="text-gray-300">School Name</Label>
                                                <Input id="school" placeholder="International School..." required className="bg-zinc-900 border-white/10 text-white focus:border-purple-500" />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button type="button" variant="ghost" onClick={() => setDemoOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white">
                                                    Submit Request
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Indicators */}
                <div className="p-6 md:p-10 flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-gray-600 font-mono hidden md:block">
                        TEST SCHOOL • SYSTEM V1.0
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Visuals */}
            <div className="absolute lg:relative inset-0 w-full lg:w-1/2 h-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                {/* Background Gradients */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse opacity-50" />
                    <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full opacity-50" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-repeat opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                </div>

                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 flex items-center justify-center p-12 lg:p-20 transition-all duration-1000 ease-in-out ${index === currentSlide
                                ? "opacity-100 scale-100 rotate-0"
                                : "opacity-0 scale-95 rotate-3 pointer-events-none"
                            }`}
                    >
                        {slide.image ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group max-h-[80vh] w-auto">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img
                                    src={slide.image}
                                    alt={slide.imageAlt}
                                    className="w-full h-full object-contain max-h-[80vh] bg-black/50"
                                />
                            </div>
                        ) : (
                            // Fallback abstract visualization for slides without images
                            <div className="relative w-full max-w-md aspect-square">
                                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20 blur-[100px] rounded-full animate-pulse`} />
                                <div className="relative z-10 w-full h-full border border-white/10 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center">
                                    <slide.icon className="w-32 h-32 text-white/50 animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
