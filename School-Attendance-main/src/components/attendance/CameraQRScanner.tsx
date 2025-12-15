import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X, AlertCircle } from "lucide-react";

interface CameraQRScannerProps {
  onScan: (qrCode: string) => void;
  isActive: boolean;
  onClose: () => void;
}

export function CameraQRScanner({ onScan, isActive, onClose }: CameraQRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const elementId = "qr-reader";

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isActive]);

  const startScanning = async () => {
    try {
      setError("");
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          // Don't stop scanning automatically - let the user control it
        },
        (errorMessage) => {
          // Ignore scan errors, they happen frequently
          console.log("Scan error:", errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting camera:", err);
      setError(err.message || "Failed to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  if (!isActive) {
    return null;
  }

  return (
    <Card className="border-primary">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Scanner
          </CardTitle>
          <CardDescription>
            Point camera at QR code to scan
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <div 
            id={elementId} 
            className="rounded-lg overflow-hidden"
            style={{ minHeight: "300px" }}
          />
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleClose} variant="outline" className="flex-1">
            Close Camera
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Tips:</strong> Hold steady, ensure good lighting, and position the QR code within the frame.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
