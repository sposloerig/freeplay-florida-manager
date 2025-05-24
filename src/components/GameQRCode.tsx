import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface GameQRCodeProps {
  gameId: string;
  gameName: string;
}

const GameQRCode: React.FC<GameQRCodeProps> = ({ gameId, gameName }) => {
  const baseUrl = window.location.origin;
  const repairUrl = `${baseUrl}/repairs/new?gameId=${gameId}`;

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={repairUrl}
        size={150}
        level="H"
        includeMargin={true}
        imageSettings={{
          src: "https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/16zjl0p-replay2_100000009905r000000028.png",
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  );
};

export default GameQRCode;