import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface GameQRCodeProps {
  gameId: string;
  shortId?: string;
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
  shortId,
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
  // Use fplay.us for shorter QR codes (falls back to current domain if not available)
  const baseUrl = 'https://fplay.us';
  // Use short URL if short_id is available, otherwise fall back to full URL
  const repairUrl = shortId 
    ? `${baseUrl}/r/${shortId}`
    : `${baseUrl}/report-issue?gameId=${gameId}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${gameName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: 2in 1in;
              margin: 0;
            }
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              margin: 0;
              padding: 0;
              width: 2in;
              height: 1in;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-container { 
              width: 2in;
              height: 1in;
              padding: 0.05in;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .game-title { 
              font-size: 9px; 
              font-weight: bold; 
              margin-bottom: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 1.9in;
            }
            .zone-info { 
              font-size: 8px; 
              color: #2563eb; 
              margin-bottom: 2px;
              font-weight: bold;
            }
            #qr-code {
              margin: 2px 0;
            }
            #qr-code img {
              display: block;
              margin: 0 auto;
            }
            .sales-section {
              background: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 2px;
              padding: 2px;
              margin: 2px 0;
              font-size: 6px;
            }
            .for-sale-badge {
              background: #0ea5e9;
              color: white;
              padding: 1px 3px;
              border-radius: 2px;
              font-size: 6px;
              font-weight: bold;
              margin-bottom: 1px;
            }
            .price {
              font-size: 8px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 1px;
            }
            .owner-name {
              font-size: 6px;
              font-weight: bold;
              margin-bottom: 1px;
            }
            .contact-detail {
              font-size: 5px;
              margin: 0;
            }
            .marketplace-info {
              font-size: 6px;
              color: #0ea5e9;
              font-weight: bold;
            }
            .instructions { 
              font-size: 6px; 
              margin-top: 2px; 
              color: #333;
              padding-top: 2px;
            }
            @media print {
              body { 
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .qr-container { 
                border: none;
              }
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
                    Visit fplay.us/marketplace<br/>
                    to make an offer or purchase
                  </div>
                `}
              </div>
            ` : ''}
            <div id="qr-code"></div>
            <div class="instructions">
              Scan to report issues
            </div>
          </div>
          <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
          <script>
            const qr = qrcode(0, 'M');
            qr.addData('${repairUrl}');
            qr.make();
            // Size optimized for 2" x 1" label (approximately 1.5" QR code)
            document.getElementById('qr-code').innerHTML = qr.createImgTag(2, 0);
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 100);
            }, 500);
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
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Printer size={16} className="mr-2" />
          Print Label (2" x 1")
        </button>
      )}
    </div>
  );
};

export default GameQRCode;