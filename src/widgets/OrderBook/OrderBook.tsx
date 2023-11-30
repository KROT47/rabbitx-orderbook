import BigNumber from 'bignumber.js';

import { useOrderBook } from '@/entities/OrderBook';
import { AskOrBidData } from '@/entities/OrderBook/AskOrBidData';

import styles from './OrderBook.module.scss';

const orderBookVisibleItems = 11;
const dp = 4;

function OrderBookRow({
  price,
  amount,
  totalAmountBN,
  fullAmountBN,
}: {
  price: string;
  amount: string;
  totalAmountBN: BigNumber;
  fullAmountBN: BigNumber;
}): JSX.Element {
  const percent = totalAmountBN.div(fullAmountBN).multipliedBy(100).toString();

  return (
    <div className={styles.row}>
      <div>{price}</div>
      <div>{amount}</div>
      <div
        className={styles.totalAmount}
        style={{
          background: `linear-gradient(to right, var(--color) ${percent}%, transparent ${percent}%)`,
        }}
      >
        {totalAmountBN.toFixed(dp)}
      </div>
    </div>
  );
}

function OrderBookRows({
  isAsks = false,
  items,
}: {
  isAsks?: boolean;
  items: AskOrBidData[];
}): JSX.Element {
  const fullAmountBN = items.reduce(
    (a, [, amount]) => a.plus(amount),
    BigNumber(0)
  );

  let totalAmountBN = isAsks ? fullAmountBN : BigNumber(0);

  return (
    <>
      {items.map(([price, amount]) => {
        if (!isAsks) {
          totalAmountBN = totalAmountBN.plus(amount);
        }

        const component = (
          <OrderBookRow
            key={price}
            {...{ price, amount, totalAmountBN, fullAmountBN }}
          />
        );

        if (isAsks) {
          totalAmountBN = totalAmountBN.minus(amount);
        }

        return component;
      })}
    </>
  );
}

export function OrderBook({ symbol }: { symbol: string }): JSX.Element {
  const { asks = [], bids = [] } = useOrderBook(symbol) ?? {};

  const [baseToken, quoteToken] = symbol.split('-');

  const preparedAsks = asks.slice(0, orderBookVisibleItems).reverse();
  const preparedBids = bids.slice(-orderBookVisibleItems).reverse();

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          Price <span>{quoteToken}</span>
        </div>
        <div>
          Amount <span>{baseToken}</span>
        </div>
        <div>
          Total <span>{baseToken}</span>
        </div>
      </div>

      <div className={styles.asks}>
        <OrderBookRows isAsks items={preparedAsks} />
      </div>

      <div className={styles.bids}>
        <OrderBookRows items={preparedBids} />
      </div>
    </div>
  );
}
