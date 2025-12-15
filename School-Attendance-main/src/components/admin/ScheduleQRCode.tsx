import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface ScheduleQRCodeProps {
  qrCode: string;
  className: string;
  period: string;
  day: string;
  room: string;
  teacher: string;
  weekNumber: number;
}

export function ScheduleQRCode({ 
  qrCode, 
  className, 
  period, 
  day, 
  room, 
  teacher,
  weekNumber 
}: ScheduleQRCodeProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${qrCode}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${className}-${period}-${day}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const svg = document.getElementById(`qr-${qrCode}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${className}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .info {
              text-align: center;
              margin-bottom: 20px;
            }
            h1 { font-size: 24px; margin: 10px 0; }
            p { font-size: 16px; margin: 5px 0; color: #666; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="info">
            <h1>${className}</h1>
            <p><strong>Period:</strong> ${period} | <strong>Day:</strong> ${day}</p>
            <p><strong>Room:</strong> ${room} | <strong>Teacher:</strong> ${teacher}</p>
            <p><strong>Week:</strong> ${weekNumber}</p>
          </div>
          ${svgData}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{className}</CardTitle>
        <CardDescription>
          {period} - {day} (Week {weekNumber}) | Room {room}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCode
            id={`qr-${qrCode}`}
            value={qrCode}
            size={200}
            level="H"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
