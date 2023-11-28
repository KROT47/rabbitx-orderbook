import { useOrderBookWS } from '@/entities/OrderBook';

import styles from './OrderBook.module.css';

export function OrderBook() {
  useOrderBookWS();

  return <div className={styles.root}>123</div>;
}
