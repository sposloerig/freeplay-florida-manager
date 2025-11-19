import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { generateQRPrintHTML } from '../utils/qrPrintStyles';

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

    const html = generateQRPrintHTML({
      gameName,
      repairUrl,
      zone,
      forSale,
      askingPrice,
      ownerName,
      ownerEmail,
      ownerPhone,
      displayContactPublicly
    });

    printWindow.document.write(html);
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