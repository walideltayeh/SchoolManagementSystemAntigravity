import { cn } from "@/lib/utils";

interface AnimatedQRLogoProps {
  size?: number;
  className?: string;
}

export function AnimatedQRLogo({ size = 48, className }: AnimatedQRLogoProps) {
  return (
    <div 
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ width: size, height: size }}
    >
      {/* QR Code Pattern */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background */}
        <rect width="48" height="48" fill="transparent" />
        
        {/* QR Code Modules - Top Left Corner */}
        <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" className="text-primary" />
        <rect x="6" y="6" width="8" height="8" rx="1" fill="white" />
        <rect x="8" y="8" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary" />
        
        {/* QR Code Modules - Top Right Corner */}
        <rect x="32" y="4" width="12" height="12" rx="2" fill="currentColor" className="text-primary" />
        <rect x="34" y="6" width="8" height="8" rx="1" fill="white" />
        <rect x="36" y="8" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary" />
        
        {/* QR Code Modules - Bottom Left Corner */}
        <rect x="4" y="32" width="12" height="12" rx="2" fill="currentColor" className="text-primary" />
        <rect x="6" y="34" width="8" height="8" rx="1" fill="white" />
        <rect x="8" y="36" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary" />
        
        {/* Data modules - scattered pattern */}
        <rect x="20" y="4" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-90" />
        <rect x="26" y="4" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-80" />
        
        <rect x="4" y="20" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-85" />
        <rect x="10" y="20" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-75" />
        <rect x="20" y="20" width="8" height="8" rx="1" fill="currentColor" className="text-primary" />
        <rect x="32" y="20" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-90" />
        <rect x="40" y="20" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-70" />
        
        <rect x="20" y="10" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-65" />
        <rect x="20" y="32" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-85" />
        <rect x="26" y="32" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-75" />
        
        <rect x="32" y="32" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-80" />
        <rect x="38" y="32" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-90" />
        <rect x="32" y="38" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-70" />
        <rect x="40" y="40" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-85" />
        
        <rect x="4" y="26" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-60" />
        <rect x="10" y="26" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-80" />
        <rect x="40" y="10" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-75" />
        <rect x="40" y="26" width="4" height="4" rx="0.5" fill="currentColor" className="text-primary opacity-65" />
      </svg>
      
      {/* Scanning Line Effect */}
      <div 
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
        style={{
          animation: "scanLine 2s ease-in-out infinite",
        }}
      />
      
      {/* Corner Glow Effects */}
      <div className="absolute top-0 left-0 w-3 h-3 bg-primary/20 rounded-full blur-sm animate-pulse" />
      <div className="absolute top-0 right-0 w-3 h-3 bg-primary/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
      
      <style>{`
        @keyframes scanLine {
          0%, 100% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            top: calc(100% - 4px);
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
