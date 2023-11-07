import { IOffer } from '@pintswap/sdk';

export interface BaseOffer {
    token: string;
    amount?: unknown;
    tokenId?: unknown;
}

export type ERC20Offer = BaseOffer | Pick<BaseOffer, 'token' | 'amount'>;
export type ERC721Offer = BaseOffer | Pick<BaseOffer, 'token' | 'tokenId'>;

export type INFTProps = {
    attributes?: any[];
    background_color?: string;
    external_url?: string;
    image: string;
    name: string;
    description: string;
    amount?: string;
    token: string;
    tokenId: string | number;
    imageBlob?: Blob | MediaSource;
    hash?: string;
};

export type IFillProps = {
    offerHash: string;
    amount: string;
};

export type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
};

export type IOrderbookProps = {
    offers: IOffer[];
};

export type ITokenProps = {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    extensions?: {
        bridgeInfo: Record<string, { tokenAddress: string }>;
    };
    balance?: string;
};

export type IMarketProps = {
    quote: string;
    bases: string[];
    buy: {
        offers: IOffer[];
        best: number;
        sum: number;
    };
    sell: {
        offers: IOffer[];
        best: number;
        sum: number;
    };
    offers: number;
};

export type IOfferProps = {
    amount: string;
    chainId: number;
    hash: string;
    multiAddr?: string;
    peer: string;
    price: string;
    ticker: string;
    type: string;
    priceUsd: string;
    priceEth: string;
    raw: IOffer;
};

export type IUserHistoryItemProps = {
    hash: string;
    timestamp: string;
    chainId: number;
    pair: string;
    maker: string;
    taker: string;
    gets: {
        amount: string;
        address: string;
        symbol: string;
        decimals: number;
    };
    gives: {
        amount: string;
        address: string;
        symbol: string;
        decimals: number;
    };
    sending: string;
    receiving: string;
};
