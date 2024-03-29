import { BigNumberish, ethers, parseUnits } from 'ethers6';
import { groupBy } from 'lodash';
import { detectTradeNetwork, hashOffer, IOffer } from '@pintswap/sdk';
import { isERC20Transfer } from '@pintswap/sdk/lib/trade';
import { fromAddress, getDecimals, toAddress, toTicker } from './token';
import { DAI, ETH, TESTING, USDC, USDT } from './constants';
import { getUsdPrice } from '../hooks';
import { IOfferProps } from './types';
import { getEthPrice, getTokenTax, getUniswapToken } from '../api';
import { convertExponentialToDecimal } from './format';
import { getChainId } from './provider';

export function getNextHighestIndex(arr: number[], value: number) {
    let i = arr.length;
    while (arr[--i] > value);
    return ++i;
}

function givesBase(offer: any) {
    return {
        pair: [
            {
                amount: offer.gives.amount,
                address: offer.gives.token,
            },
            {
                amount: offer.gets.amount,
                address: offer.gets.token,
            },
        ],
        type: 'bid',
    };
}
function givesTrade(offer: any) {
    return { pair: givesBase(offer).pair.reverse(), type: 'ask' };
}

export const sortBids = (orders: any) => {
    return (orders || []).slice().sort((a: any, b: any) => {
        return Number(b.price) - Number(a.price);
    });
};

export const sortAsks = (orders: any) => {
    return (orders || []).slice().sort((a: any, b: any) => {
        return Number(b.price) - Number(a.price);
    });
};

export const sortLimitOrders = (limitOrders: any) => {
    return Object.values(groupBy(limitOrders, 'ticker'))
        .map((v: any) => {
            const { bid, ask } = groupBy(v, 'type');
            return sortAsks(ask).concat(sortBids(bid));
        })
        .reduce((r, v) => r.concat(v), []);
};

export function orderTokens(offer: any, chainId: number) {
    const mapped = {
        gives: {
            amount: offer.gives.amount,
            token: toAddress(offer.gives.token, chainId),
        },
        gets: {
            token: toAddress(offer.gets.token, chainId),
            amount: offer.gets.amount,
        },
    };
    if (mapped.gives.token === USDC(chainId)?.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === USDC(chainId)?.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === USDT(chainId)?.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === USDT(chainId)?.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === DAI(chainId)?.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === DAI(chainId)?.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === ETH(chainId)?.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === ETH(chainId)?.address) {
        return givesTrade(mapped);
    } else if (Number(mapped.gives.token.toLowerCase()) < Number(mapped.gets.token.toLowerCase())) {
        return givesBase(mapped);
    } else return givesTrade(mapped);
}

export async function formattedFromTransfer(transfer: any, chainId: number) {
    const token = toAddress(transfer.token, chainId);
    return {
        token,
        amount: ethers.toBeHex(
            ethers.parseUnits(transfer.amount, await getDecimals(token, chainId)),
        ),
    };
}

export async function fromFormatted(trade: any, chainId: number) {
    const [givesToken, getsToken] = [trade.gives, trade.gets].map((v) =>
        toAddress(v.token, chainId),
    );
    const returnObj = {
        gives: {
            token: givesToken,
            amount: ethers.toBeHex(
                ethers.parseUnits(trade.gives.amount, await getDecimals(givesToken, chainId)),
            ),
        },
        gets: {
            amount: ethers.toBeHex(
                ethers.parseUnits(trade.gets.amount, await getDecimals(getsToken, chainId)),
            ),
            token: getsToken,
        },
    };
    return returnObj;
}

export async function toFormatted(transfer: any, chainId: number) {
    if (!isERC20Transfer(transfer)) return transfer;
    const token = fromAddress(transfer.token, chainId);
    const decimals = await getDecimals(transfer.token, chainId);
    const amount = Number(ethers.formatUnits(transfer.amount, decimals)).toFixed(4);
    return {
        token,
        amount,
    };
}

export async function toLimitOrder(
    offer: IOffer | any,
    allOffers: IOfferProps[],
): Promise<IOfferProps> {
    const found = allOffers.find((o) => o.hash === hashOffer(offer));
    if (found) return found;
    const chainId = await detectTradeNetwork(offer);
    const {
        pair: [base, trade],
        type,
    } = orderTokens(offer, chainId);

    const { gives, gets } = offer as IOffer;
    const [
        givesDetails,
        getsDetails,
        eth,
        tradeDecimals,
        tradeTokenTax,
        baseTokenTax,
        ticker,
        baseDecimals,
    ] = await Promise.all([
        getUniswapToken({ address: gives?.token, chainId }),
        getUniswapToken({ address: gets?.token, chainId }),
        getEthPrice(),
        getDecimals(trade.address, chainId),
        getTokenTax(trade.address, chainId),
        getTokenTax(base.address, chainId),
        toTicker([base, trade], chainId),
        getDecimals(base.address, chainId),
    ]);

    let givesPrice: number;
    if (givesDetails?.token?.derivedETH) {
        const givesEthPrice = parseFloat(givesDetails.token?.derivedETH);
        givesPrice = givesEthPrice * Number(eth);
    } else {
        givesPrice = parseFloat(givesDetails?.token?.lastPriceUSD);
    }
    const givesAmount = Number(
        ethers.formatUnits(gives.amount || '', Number(givesDetails?.token?.decimals || '18')),
    );

    let getsPrice: number;
    if (getsDetails?.token?.derivedETH) {
        const getsEthPrice = parseFloat(getsDetails.token?.derivedETH);
        getsPrice = getsEthPrice * Number(eth);
    } else {
        getsPrice = parseFloat(getsDetails?.token?.lastPriceUSD);
    }
    const getsAmount = Number(
        ethers.formatUnits(gets?.amount || '', Number(getsDetails?.token?.decimals || '18')),
    );

    const calculateExchangeRate = () => {
        let rate: number;
        if (type === 'ask') {
            rate = getsAmount / givesAmount;
        } else {
            rate = givesAmount / getsAmount;
        }
        return convertExponentialToDecimal(rate); // TODO: do better
    };
    const calculateUsdExchangeRate = () => {
        let rate: number;
        if (type === 'ask') {
            rate = (getsAmount / givesAmount) * getsPrice;
        } else {
            rate = (givesAmount / getsAmount) * givesPrice;
        }
        return convertExponentialToDecimal(rate); // TODO: do better
    };
    const usdExchangeRate = calculateUsdExchangeRate();
    const nativeExchangeRate = calculateExchangeRate();
    const amount = ethers.formatUnits(trade.amount, tradeDecimals || 18);
    const baseAmount = ethers.formatUnits(base.amount, baseDecimals || 18);
    const usdPrice = await getUsdPrice(trade.address, eth);
    const usdTotal = Number(usdPrice) * Number(amount);
    return {
        chainId: offer.chainId || 1,
        price: String(usdExchangeRate) || '0',
        exchangeRate: String(nativeExchangeRate) || '0',
        amount,
        baseAmount,
        type,
        ticker,
        hash: offer?.hash || '',
        priceUsd: String(usdTotal),
        priceEth: (usdTotal * Number(eth)).toString(),
        tax: {
            buy: tradeTokenTax.buy + baseTokenTax.buy,
            sell: tradeTokenTax.sell + baseTokenTax.sell,
            [base.address]: baseTokenTax,
            [trade.address]: tradeTokenTax,
        },
        raw: { gives: (offer as IOffer).gives, gets: (offer as IOffer).gets },
        peer: offer?.peer || '',
        multiAddr: offer?.peer || '',
    };
}

export function filterERC20OffersForTicker(
    offers: any[],
    pair: string,
    type: 'ask' | 'bid',
    chainId: number,
): any[] {
    if (!offers || offers.length === 0) return [];
    const filtered = offers.filter((v) => isERC20Transfer(v.gives) && isERC20Transfer(v.gets));
    const [trade, base] = pair.split('/');
    const [tradeAddress, baseAddress] = [trade, base]
        .map((x) => toAddress(x, chainId))
        .map((v) => v.toLowerCase());
    const [givesAddress, getsAddress] =
        type === 'ask' ? [tradeAddress, baseAddress] : [baseAddress, tradeAddress];
    return filtered.filter(
        (v) =>
            v.gives.token.toLowerCase() === givesAddress &&
            v.gets.token.toLowerCase() === getsAddress,
    );
}

export function matchOffers(offers: any[], amount: BigNumberish) {
    const sorted = offers
        .slice()
        .sort(
            (a, b) =>
                (Number(a.gets.amount) * 1e9) / Number(a.gives.amount) -
                (Number(b.gets.amount) * 1e9) / Number(b.gives.amount),
        );
    const toFill = ethers.toBigInt(amount as any);
    const fill = sorted.reduce(
        (() => {
            let filled = ethers.toBigInt(0);
            return (r, v) => {
                const getsAmount = ethers.toBigInt(v.gets.amount);
                const remaining = toFill - filled;
                if (remaining <= 0) return r;
                filled += getsAmount;
                // if (TESTING)
                //     console.log(
                //         '#matchOffers',
                //         '\nRemaining:',
                //         remaining,
                //         '\ngetsAmount:',
                //         getsAmount,
                //     );
                if (remaining >= getsAmount) {
                    r.push({
                        amount: getsAmount,
                        offer: v,
                        effective: {
                            gets: getsAmount,
                            gives: ethers.toBigInt(v.gives.amount),
                        },
                    });
                } else {
                    r.push({
                        amount: remaining,
                        offer: v,
                        effective: {
                            gets: remaining,
                            gives:
                                (ethers.toBigInt(remaining) * ethers.toBigInt(v.gives.amount)) /
                                ethers.toBigInt(getsAmount),
                        },
                    });
                }
                return r;
            };
        })(),
        [],
    );
    const effective = fill.reduce(
        (r: any, v: any) => ({
            gets: v.effective.gets + r.gets,
            gives: v.effective.gives + r.gives,
        }),
        { gets: ethers.toBigInt(0), gives: ethers.toBigInt(0) },
    );
    if (TESTING) console.log('#matchOffers', '\nfill:', fill, '\neffective', effective);
    return {
        fill,
        effective,
    };
}

export const bestPrices = (orders: any) => {
    const { ask, bid } = groupBy(orders, 'type');
    const bestAsk = (ask || []).slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
    const bestBid = (bid || []).slice().sort((a, b) => Number(b.price) - Number(a.price))[0];
    return {
        bid: (bestBid?.price && bestBid.price) || '-',
        ask: (bestAsk?.price && bestAsk.price) || '-',
    };
};
