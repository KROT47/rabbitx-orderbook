import { Centrifuge } from 'centrifuge';
import { useEffect, useState } from 'react';

export function useCentrifugeWS({
  url,
  token,
}: {
  url: string;
  token: string;
}): Centrifuge | undefined {
  const [ws, setWS] = useState<Centrifuge>();

  useEffect(() => {
    if (ws === undefined) {
      console.log('WS connecting...');

      const newWS = new Centrifuge(url, { token });

      newWS.on('connected', () => {
        console.log('WS connected');
      });

      newWS.on('error', err => {
        console.log('WS error', err);
      });

      newWS.on('disconnected', () => {
        console.log('WS disconnected');
        // reconnect
        setWS(undefined);
      });

      setWS(newWS);
    }
  }, [token, url, ws]);

  return ws;
}
