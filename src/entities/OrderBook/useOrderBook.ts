import { useCallback, useEffect, useMemo, useState } from 'react';

import { AskOrBidData } from './AskOrBidData';
import { OBData } from './OBData';
import { useOrderBookWS } from './useOrderBookWS';

type OrderBookData = {
  asks: AskOrBidData[];
  bids: AskOrBidData[];
};

function normalizePrice(price: string): string {
  return `${Number(price)}`;
}

function normalizePrices(arr: AskOrBidData[]): AskOrBidData[] {
  return arr.map(
    ([price, value]) => [normalizePrice(price), value] as AskOrBidData
  );
}

// since both arrays from server are sorted in ASC order we can do this
function getUpdatedArr(
  currArr: AskOrBidData[],
  arr: AskOrBidData[]
): AskOrBidData[] {
  const normalizedArr = normalizePrices(arr);
  const newArr = [];

  let i = 0;
  let j = 0;
  while (j < normalizedArr.length) {
    const data = normalizedArr[j];
    const [price, value] = data;

    while (i < currArr.length) {
      const [currPrice] = currArr[i];

      if (currPrice === price) {
        i++;
        j++;
        if (Number(value) > 0) {
          newArr.push(data);
          break;
        }
      } else if (Number(currPrice) < Number(price)) {
        newArr.push(currArr[i++]);
      } else {
        if (Number(value) > 0) {
          newArr.push(data);
        }
        j++;
        break;
      }
    }

    if (i === currArr.length) break;
  }

  return newArr.concat(currArr.slice(i)).concat(normalizedArr.slice(j));
}

export function useOrderBook(symbol: string): OrderBookData | undefined {
  const [data, setData] = useState<OrderBookData>();

  const updateBuffer: OBData[] = useMemo(() => [], []);

  const onDataLoaded = useCallback(({ asks = [], bids = [] }: OBData) => {
    setData({
      asks: normalizePrices(asks),
      bids: normalizePrices(bids),
    });
  }, []);

  const onUpdate = useCallback(
    (updateData: OBData) => {
      if (data !== undefined && !updateBuffer.length) {
        const { asks = [], bids = [] } = updateData;

        setData({
          asks: getUpdatedArr(data.asks, asks),
          bids: getUpdatedArr(data.bids, bids),
        });
      } else {
        updateBuffer.push(updateData);
      }
    },
    [data, updateBuffer]
  );

  useEffect(() => {
    if (data !== undefined && updateBuffer.length > 0) {
      let updateData;
      while ((updateData = updateBuffer.shift())) {
        onUpdate(updateData);
      }
    }
  }, [data, onUpdate, updateBuffer]);

  useOrderBookWS(symbol, {
    onDataLoaded,
    onUpdate,
  });

  return data;
}
