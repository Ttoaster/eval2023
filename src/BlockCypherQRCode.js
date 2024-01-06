import React from 'react';
import QRCode from 'qrcode.react';

const BlockCypherQRCode = ({ publicAddress }) => {
  return (
    <div>
      <h4>Public Address: {publicAddress}</h4>
      <QRCode value={publicAddress} />
    </div>
  );
};

export default BlockCypherQRCode;