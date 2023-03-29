import { ITokenProps, TOKENS } from "./token-list";

// GENERAL
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING = NETWORK === 'LOCALHOST' ? true : false;
export const BASE_URL = 'pintswap.eth.link/';

// DEFAULT VALS
export const EMPTY_TRADE: ITradeProps = {
    tokenIn: '',
    amountIn: '',
    tokenOut: '',
    amountOut: '',
};

// TYPES
export type ITradeProps = {
    tokenIn: string;
    amountIn: string;
    tokenOut: string;
    amountOut: string;
};

// CSS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

// UTILS
export const alphaTokenSort = (a: ITokenProps, b: ITokenProps) => {
    const textA = a.symbol.toUpperCase();
    const textB = b.symbol.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
}

export const getDecimals = (token: string) => {
    let found;
    if(token.includes('0x')) {
        found = TOKENS.find((el) => el.address === token)?.decimals;
    } else {
        found = TOKENS.find((el) => el.symbol === token)?.decimals;
    }
    return found;
}

export function truncate(s: string, amount?: number) {
    return `${s.slice(0, amount ? amount : 4)}...${s.slice(amount ? (amount * -1) : -4)}`;
}
