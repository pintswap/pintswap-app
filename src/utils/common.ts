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
