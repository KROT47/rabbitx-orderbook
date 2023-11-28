import { useEffect } from 'react';

import { useCentrifugeWS } from '@/shared';

import { orderBookWSToken, orderBookWSURL } from './constants';

export function useOrderBookWS() {
  const ws = useCentrifugeWS({ url: orderBookWSURL, token: orderBookWSToken });

  useEffect(() => {
    if (ws !== undefined) {
      const sub = ws.newSubscription('orderbook:BTC-USD');

      sub.on('publication', ctx => {
        console.log(ctx.data);
      });

      sub.subscribe();

      ws.connect();

      return () => {
        sub.unsubscribe();
        sub.removeAllListeners();
        ws.disconnect();
      };
    }
  }, [ws]);
}
