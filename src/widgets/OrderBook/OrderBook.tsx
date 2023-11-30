import { useOrderBook } from '@/entities/OrderBook';

import styles from './OrderBook.module.css';

const orderBookVisibleItems = 11;

export function OrderBook() {
  const { asks = [], bids = [] } = useOrderBook('BTC-USD') ?? {};

  const preparedAsks = asks.slice(0, orderBookVisibleItems).reverse();
  const preparedBids = bids.slice(-orderBookVisibleItems).reverse();

  return (
    <div className={styles.root}>
      {preparedAsks.map(([price, value]) => (
        <div key={price}>
          {price} - {value}
        </div>
      ))}
      -------
      {preparedBids.map(([price, value]) => (
        <div key={price}>
          {price} - {value}
        </div>
      ))}
    </div>
  );
}
