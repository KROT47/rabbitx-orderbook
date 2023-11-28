import { Centrifuge } from 'centrifuge';

export function getCentrifugeWS({
  url,
  token,
}: {
  url: string;
  token: string;
}): Centrifuge {
  return new Centrifuge(url, {
    token,
  });
}
