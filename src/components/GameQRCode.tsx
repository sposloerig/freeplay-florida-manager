import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface GameQRCodeProps {
  gameId: string;
  gameName: string;
  zone?: string;
  printable?: boolean;
  // Sales information
  forSale?: boolean;
  askingPrice?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  displayContactPublicly?: boolean;
}

const GameQRCode: React.FC<GameQRCodeProps> = ({ 
  gameId, 
  gameName, 
  zone, 
  printable = false,
  forSale = false,
  askingPrice,
  ownerName,
  ownerEmail,
  ownerPhone,
  displayContactPublicly = false
}) => {
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
              max-width: ${forSale ? '400px' : '300px'};
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
            .sales-section {
              background: #f0f9ff;
              border: 2px solid #0ea5e9;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
            }
            .for-sale-badge {
              background: #0ea5e9;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .price {
              font-size: 20px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 10px;
            }
            .owner-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .contact-detail {
              font-size: 12px;
              margin: 2px 0;
            }
            .marketplace-info {
              font-size: 11px;
              color: #0ea5e9;
              font-weight: bold;
            }
            .instructions { 
              font-size: 12px; 
              margin-top: 15px; 
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 2px solid #000; }
              .sales-section { border: 2px solid #0ea5e9; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="game-title">${gameName}</div>
            ${zone ? `<div class="zone-info">📍 ${zone}</div>` : ''}
            ${forSale ? `
              <div class="sales-section">
                <div class="for-sale-badge">🏷️ FOR SALE</div>
                ${askingPrice ? `<div class="price">$${askingPrice.toLocaleString()}</div>` : '<div class="price">Price on request</div>'}
                ${displayContactPublicly && (ownerEmail || ownerPhone) ? `
                  <div class="contact-info">
                    ${ownerName ? `<div class="owner-name">Owner: ${ownerName}</div>` : ''}
                    ${ownerEmail ? `<div class="contact-detail">📧 ${ownerEmail}</div>` : ''}
                    ${ownerPhone ? `<div class="contact-detail">📞 ${ownerPhone}</div>` : ''}
                  </div>
                ` : `
                  <div class="marketplace-info">
                    Visit freeplayflorida.netlify.app/marketplace<br/>
                    to make an offer or purchase
                  </div>
                `}
              </div>
            ` : ''}
            <div id="qr-code"></div>
            <div class="instructions">
              <strong>Primary:</strong> Scan to report issues<br/>
              Free Play Florida
            </div>
          </div>
          <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
          <script>
            const qr = qrcode(0, 'H');
            qr.addData('${repairUrl}');
            qr.make();
            document.getElementById('qr-code').innerHTML = qr.createImgTag(${forSale ? '6' : '4'}, 8);
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`bg-white rounded-lg shadow-sm ${forSale ? 'p-6 border-4 border-blue-500' : 'p-4 border-2 border-gray-200'}`}>
        <div className="text-center mb-3">
          <h3 className="font-bold text-gray-900">{gameName}</h3>
          {zone && (
            <p className="text-sm text-fpf-600 font-semibold">📍 {zone}</p>
          )}
          {forSale && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-400 rounded-xl p-4 mt-4 mb-4 shadow-md">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-3 py-2 rounded-lg mb-3 inline-block shadow-sm">
                🏷️ FOR SALE
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-3">
                {askingPrice ? `$${askingPrice.toLocaleString()}` : 'Price on request'}
              </div>
              {displayContactPublicly && (ownerEmail || ownerPhone) ? (
                <div className="text-sm space-y-1 bg-white rounded-lg p-3 border border-blue-200">
                  {ownerName && <div className="font-bold text-gray-800">Owner: {ownerName}</div>}
                  {ownerEmail && <div className="text-blue-600">📧 {ownerEmail}</div>}
                  {ownerPhone && <div className="text-blue-600">📞 {ownerPhone}</div>}
                </div>
              ) : (
                <div className="text-sm text-blue-700 font-bold bg-white rounded-lg p-3 border border-blue-200">
                  Visit marketplace to make offer
                </div>
              )}
            </div>
          )}
        </div>
        <QRCodeSVG
          value={repairUrl}
          size={forSale ? 200 : 150}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
        <div className="text-xs text-gray-500 text-center mt-2 border-t border-gray-200 pt-2">
          <strong>Primary:</strong> Scan to report issues
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