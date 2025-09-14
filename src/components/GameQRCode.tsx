import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface GameQRCodeProps {
  gameId: string;
  gameName: string;
  zone?: string;
  printable?: boolean;
}

const GameQRCode: React.FC<GameQRCodeProps> = ({ gameId, gameName, zone, printable = false }) => {
  const baseUrl = window.location.origin;
  const repairUrl = `${baseUrl}/report-issue?gameId=${gameId}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${gameName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
            }
            .qr-container { 
              border: 2px solid #000; 
              padding: 20px; 
              margin: 20px auto; 
              max-width: 300px;
              background: white;
            }
            .game-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .zone-info { 
              font-size: 16px; 
              color: #2563eb; 
              margin-bottom: 15px;
              font-weight: bold;
            }
            .instructions { 
              font-size: 12px; 
              margin-top: 15px; 
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="game-title">${gameName}</div>
            ${zone ? `<div class="zone-info">📍 ${zone}</div>` : ''}
            <div id="qr-code"></div>
            <div class="instructions">
              Scan to report issues<br/>
              Free Play Florida
            </div>
          </div>
          <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
          <script>
            const qr = qrcode(0, 'H');
            qr.addData('${repairUrl}');
            qr.make();
            document.getElementById('qr-code').innerHTML = qr.createImgTag(4, 8);
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
        <div className="text-center mb-3">
          <h3 className="font-bold text-gray-900">{gameName}</h3>
          {zone && (
            <p className="text-sm text-fpf-600 font-semibold">📍 {zone}</p>
          )}
        </div>
        <QRCodeSVG
          value={repairUrl}
          size={150}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
        <div className="text-xs text-gray-500 text-center mt-2">
          Scan to report issues
        </div>
      </div>
      
      {printable && (
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 transition-colors"
        >
          <Printer size={16} className="mr-2" />
          Print QR Code
        </button>
      )}
    </div>
  );
};

export default GameQRCode;