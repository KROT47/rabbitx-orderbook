import { useEffect, useRef } from 'react';

import { useCentrifugeWS } from '@/shared';

import { orderBookWsToken, orderBookWsUrl } from './constants';
import { OBData } from './OBData';

export function useOrderBookWS(
  symbol: string,
  {
    onDataLoaded,
    onUpdate,
  }: {
    onDataLoaded: (data: OBData) => void;
    onUpdate: (data: OBData) => void;
  }
) {
  const ws = useCentrifugeWS({ url: orderBookWsUrl, token: orderBookWsToken });

  const onLoaded = useRef<(data: OBData) => void>();
  onLoaded.current = onDataLoaded;

  const onUpdated = useRef<(data: OBData) => void>();
  onUpdated.current = onUpdate;

  const lastSeq = useRef<number>();

  useEffect(() => {
    if (ws !== undefined) {
      try {
        const sub = ws.newSubscription(`orderbook:${symbol}`);

        sub.on('subscribed', ctx => {
          // console.log('sub', ctx.data);

          lastSeq.current = ctx.data.sequence;

          onLoaded.current?.(ctx.data);
        });

        sub.on('publication', ctx => {
          // console.log('pub', ctx.data);

          if (lastSeq.current !== undefined) {
            if (ctx.data.sequence - lastSeq.current > 1) {
              // resubscribe if sequence was missed
              sub.unsubscribe();
              sub.subscribe();
            } else {
              lastSeq.current = ctx.data.sequence;
              onUpdated.current?.(ctx.data);
            }
          }
        });

        sub.subscribe();

        ws.connect();

        return () => {
          sub.unsubscribe();
          sub.removeAllListeners();
          ws.disconnect();
        };
      } catch (e) {
        console.error(e);
      }
    }
  }, [symbol, ws]);
}
