import { useState, useEffect } from "react";
import { Camera, Scan, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraQRScanner } from "./CameraQRScanner";

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isActive: boolean;
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual");
  const [showCamera, setShowCamera] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  if (!isActive) {
    return null;
  }

  if (showCamera) {
    return (
      <CameraQRScanner
        onScan={onScan}
        isActive={showCamera}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Scan Student QR Code
        </CardTitle>
        <CardDescription>
          Scan or enter student QR code to record attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={scanMode === "manual" ? "default" : "outline"}
            onClick={() => {
              setScanMode("manual");
              setShowCamera(false);
            }}
            className="flex-1"
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Manual Entry
          </Button>
          <Button
            variant={scanMode === "camera" ? "default" : "outline"}
            onClick={() => {
              setScanMode("camera");
              setShowCamera(true);
            }}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Camera Scanner
          </Button>
        </div>

        {scanMode === "manual" && !showCamera && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="qr-input">Student Code</Label>
              <Input
                id="qr-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter student code..."
                autoFocus
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Enter the student code (same as registration)
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={!manualInput.trim()}>
              <Scan className="mr-2 h-4 w-4" />
              Submit Attendance
            </Button>
          </form>
        )}

      </CardContent>
    </Card>
  );
}
