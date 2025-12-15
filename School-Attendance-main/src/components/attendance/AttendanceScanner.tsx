
import { useState, useEffect } from "react";
import { QrCode, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ScanRecord } from "@/services/dataService";

interface AttendanceScannerProps {
  type: "classroom" | "bus";
  selectedItemName: string;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  recentScans: ScanRecord[];
}

export function AttendanceScanner({ 
  type, 
  selectedItemName, 
  isScanning, 
  onStartScan, 
  onStopScan, 
  recentScans 
}: AttendanceScannerProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {isScanning && (
        <Card className="bg-muted/50 border-school-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-school-primary" />
              Scanner Active
            </CardTitle>
            <CardDescription>
              Scanning for {type === "classroom" ? "Class" : "Bus Route"}: {selectedItemName}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertTitle>Ready to scan</AlertTitle>
              <AlertDescription>
                Scan student ID cards or bracelets to record attendance.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onStopScan}
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Stop Scanning
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>
              History of recent attendance scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    scan.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-school-success" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-school-danger" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{scan.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {scan.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={scan.success ? "default" : "outline"} className={scan.success ? "bg-school-success" : "text-school-danger"}>
                      {scan.success ? "Checked In" : "Failed"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(scan.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
