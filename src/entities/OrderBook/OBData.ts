import { AskOrBidData } from './AskOrBidData';

export type OBData = {
  asks: AskOrBidData[] | undefined;
  bids: AskOrBidData[] | undefined;
  sequence: number;
};
