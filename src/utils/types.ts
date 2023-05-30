import { IOffer } from "@pintswap/sdk";

export interface BaseOffer {
    token: string;
    amount?: unknown;
    tokenId?: unknown;
}

export type ERC20Offer = BaseOffer | Pick<BaseOffer, 'token' | 'amount'>;
export type ERC721Offer = BaseOffer | Pick<BaseOffer, 'token' | 'tokenId'>;

export type INFTProps = {
    attributes: any[];
    background_color: string;
    external_url: string;
    image: string;
    name: string;
    description: string;
    amount?: string;
    token: string;
    tokenId: string | number;
    imageBlob: Blob | MediaSource;
    hash: string;
  }

  export type IFillProps = {
    offerHash: string;
    amount: string;
}

export type IOrderStateProps = {
  orderHash: string;
  multiAddr: string | any;
};

export type IOrderbookProps = {
  offers: IOffer[];
};

