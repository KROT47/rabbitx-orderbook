import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
        newArr.push(currArr[i]);
        i++;
      } else {
        j++;
        if (Number(value) > 0) {
          newArr.push(data);
        }
        break;
      }
    }

    if (i === currArr.length) break;
  }

  return newArr
    .concat(currArr.slice(i))
    .concat(normalizedArr.slice(j).filter(([, value]) => Number(value) > 0));
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

  const isUpdatingRef = useRef(false);

  const onUpdate = useCallback(() => {
    if (
      !isUpdatingRef.current &&
      data !== undefined &&
      updateBuffer.length > 0
    ) {
      isUpdatingRef.current = true;
      let updateData;
      let newAsks: AskOrBidData[] = data.asks;
      let newBids: AskOrBidData[] = data.bids;

      while ((updateData = updateBuffer.shift())) {
        const { asks = [], bids = [] } = updateData;

        newAsks = getUpdatedArr(newAsks, asks);
        newBids = getUpdatedArr(newBids, bids);
      }

      setData({
        asks: newAsks,
        bids: newBids,
      });
    }
  }, [data, updateBuffer]);

  useEffect(() => {
    isUpdatingRef.current = false;
    onUpdate();
  }, [onUpdate]);

  useOrderBookWS(symbol, {
    onDataLoaded,
    onUpdate: (updateData: OBData) => {
      updateBuffer.push(updateData);
      onUpdate();
    },
  });

  return data;
}
