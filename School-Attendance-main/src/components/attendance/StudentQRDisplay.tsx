import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { Download, Printer } from "lucide-react";

interface StudentQRDisplayProps {
  studentName: string;
  studentCode: string;
  qrCode: string;
  grade: string;
  section: string;
}

export function StudentQRDisplay({ 
  studentName, 
  studentCode, 
  qrCode, 
  grade, 
  section 
}: StudentQRDisplayProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`student-qr-${studentCode}`);
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
      downloadLink.download = `student-qr-${studentCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student QR Code - ${studentName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container { text-align: center; }
            h1 { margin: 0 0 10px 0; }
            .info { margin: 10px 0; color: #666; }
            .qr-container { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${studentName}</h1>
            <div class="info">Student Code: ${studentCode}</div>
            <div class="info">Grade ${grade} - Section ${section}</div>
            <div class="qr-container">
              ${document.getElementById(`student-qr-${studentCode}`)?.outerHTML}
            </div>
            <div class="info">Scan this QR code for attendance</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{studentName}</CardTitle>
        <CardDescription>
          Grade {grade} - Section {section} | Code: {studentCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCode
            id={`student-qr-${studentCode}`}
            value={qrCode}
            size={200}
            level="H"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
