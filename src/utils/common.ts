// GENERAL
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING = NETWORK === 'LOCALHOST' ? true : false;

// DEFAULT VALS
export const EMPTY_TRADE: ITradeProps = {
    'Input Token': '',
    'Input Amount': '',
    'Output Token': '',
    'Output Amount': '',
};

// TYPES
export type ITradeProps = {
    'Input Token': string;
    'Input Amount': string;
    'Output Token': string;
    'Output Amount': string;
};
