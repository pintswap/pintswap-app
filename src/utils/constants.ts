// GENERAL
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING = NETWORK === 'LOCALHOST' ? true : false;
