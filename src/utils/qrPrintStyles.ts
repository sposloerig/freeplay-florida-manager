/**
 * Standardized QR Code Print Styles for 2" x 1" Labels
 * Landscape orientation with QR code on left, text on right
 */

export const QR_PRINT_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page {
    size: 2in 1in landscape;
    margin: 0;
  }
  
  body { 
    font-family: Arial, sans-serif; 
    margin: 0;
    padding: 0;
    width: 2in;
    height: 1in;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
  }
  
  .qr-container { 
    width: 2in;
    height: 1in;
    padding: 0.08in;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
  }
  
  .qr-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 0.02in 0;
  }
  
  .text-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
  }
  
  .scan-text {
    font-size: 13px;
    font-weight: bold;
    line-height: 1.1;
    margin-bottom: 0.02in;
    text-align: left;
  }
  
  .game-title { 
    font-size: 8px; 
    font-weight: normal; 
    margin-bottom: 0.02in;
    line-height: 1;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: #666;
  }
  
  .zone-info { 
    font-size: 7px; 
    color: #2563eb; 
    margin-bottom: 0.02in;
    font-weight: bold;
  }
  
  .report-text {
    font-size: 13px;
    font-weight: bold;
    line-height: 1.1;
    margin-top: 0.02in;
    text-align: left;
  }
  
  #qr-code {
    margin: 0;
    line-height: 0;
  }
  
  #qr-code img {
    display: block;
    margin: 0;
  }
  
  .sales-section {
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 2px;
    padding: 3px;
    margin: 2px 0;
    font-size: 6px;
  }
  
  .for-sale-badge {
    background: #0ea5e9;
    color: white;
    padding: 2px 4px;
    border-radius: 2px;
    font-size: 6px;
    font-weight: bold;
    margin-bottom: 2px;
    display: inline-block;
  }
  
  .price {
    font-size: 8px;
    font-weight: bold;
    color: #0ea5e9;
    margin: 2px 0;
  }
  
  .owner-name {
    font-size: 6px;
    font-weight: bold;
    margin: 1px 0;
  }
  
  .contact-detail {
    font-size: 5px;
    margin: 0;
    line-height: 1.2;
  }
  
  .marketplace-info {
    font-size: 6px;
    color: #0ea5e9;
    font-weight: bold;
    line-height: 1.3;
  }
  
  .instructions { 
    font-size: 7px; 
    margin-top: 4px; 
    color: #333;
    line-height: 1.3;
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
`;

interface QRPrintTemplateOptions {
  gameName: string;
  repairUrl: string;
  zone?: string;
  forSale?: boolean;
  askingPrice?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  displayContactPublicly?: boolean;
}

export function generateQRPrintHTML(options: QRPrintTemplateOptions): string {
  const {
    gameName,
    repairUrl,
    zone,
    forSale = false,
    askingPrice,
    ownerName,
    ownerEmail,
    ownerPhone,
    displayContactPublicly = false
  } = options;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code - ${gameName}</title>
        <style>${QR_PRINT_STYLES}</style>
      </head>
      <body>
        <div class="qr-container">
          <div class="scan-text">SCAN<br>ME</div>
          ${forSale ? `<div class="game-title">${gameName}${askingPrice ? ` - $${askingPrice.toLocaleString()}` : ''}</div>` : `<div class="game-title">${gameName}</div>`}
          <div class="qr-section">
            <div id="qr-code"></div>
          </div>
          <div class="report-text">TO REPORT<br>ISSUE</div>
        </div>
        <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
        <script>
          const qr = qrcode(0, 'M');
          qr.addData('${repairUrl}');
          qr.make();
          document.getElementById('qr-code').innerHTML = qr.createImgTag(2.5, 0);
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 100);
          }, 500);
        </script>
      </body>
    </html>
  `;
}

