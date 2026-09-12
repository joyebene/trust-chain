const DEFAULT_USD_NGN_RATE = 1500;

export function getUsdNgnRate() {
  const rate = Number(process.env.USD_NGN_RATE);

  if (!rate || rate <= 0) {
    return DEFAULT_USD_NGN_RATE;
  }

  return rate;
}

export function ngnToUsd(amountNGN: number) {
  const rate = getUsdNgnRate();

  return amountNGN / rate;
}

export function usdToNgn(amountUSD: number) {
  const rate = getUsdNgnRate();

  return amountUSD * rate;
}