export interface BaseOffer {
    token: string;
    amount?: unknown;
    tokenId?: unknown;
}

export type ERC20Offer = BaseOffer | Pick<BaseOffer, 'token' | 'amount'>;
export type ERC721Offer = BaseOffer | Pick<BaseOffer, 'token' | 'tokenId'>;
