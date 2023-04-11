import { JSONPeerId } from "peer-id";
import { IOffer } from "@pintswap/sdk";
import { ITokenProps, TOKENS } from "./token-list";
import { ethers } from "ethers";

// GENERAL
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;

// DEFAULT VALS
export const EMPTY_TRADE: IOffer = {
    getsToken: '',
    getsAmount: '',
    givesToken: '',
    givesAmount: '',
};

export const EMPTY_PEER: JSONPeerId = {
    id: '',
    privKey: '',
    pubKey: ''
}

// CSS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

// HELPER FUNCTIONS
export const alphaTokenSort = (a: ITokenProps, b: ITokenProps) => {
    const textA = a.symbol.toUpperCase();
    const textB = b.symbol.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
}

export const getDecimals = (token: string) => {
    let found;
    if(token.startsWith('0x')) {
        found = TOKENS.find((el) => el.address.toLowerCase() === token.toLowerCase())?.decimals;
    } else {
        found = TOKENS.find((el) => el.symbol.toLowerCase() === token.toLowerCase())?.decimals;
    }
    return found || 18;
}

export function getTokenAttributes(token: string, attribute?: keyof ITokenProps) {
    let found;
    if(!token) return token;
    if(token.includes('0x')) {
        found = TOKENS.find(el => el.address.toLowerCase() === token.toLowerCase());
    } else {
        found = TOKENS.find(el => el.symbol.toLowerCase() === token.toLowerCase());
    }
    if(found) {
        if(attribute) return found[attribute];
        else return found;
    } else {
        console.warn('#getTokenAttributes: Error finding token', {
            token,
            found
        })
        return '';
    }
}

export function convertAmount(to: 'hex' | 'number' | 'readable', amount: string, token: string) {
    let output;
    if(to === 'hex') {
        if(amount.startsWith('0x')) output = amount;
        else output = ethers.utils
            .parseUnits(amount, getDecimals(token))
            .toHexString()
    } else {
        if(amount.startsWith('0x')) output = ethers.utils
            .formatUnits(amount, getDecimals(token))
        else output = amount;
    }
    if(TESTING) console.log("#convertAmount:", { amount, token, output })
    return to === 'readable' ? `${output}  ${getTokenAttributes(token, 'symbol') || 'N/A'}` : output;
}

export function truncate(s: string, amount?: number) {
    if(!s) return s;
    return `${s.slice(0, amount ? amount : 4)}...${s.slice(amount ? (amount * -1) : -4)}`;
}

export function defer() {
    let resolve,
        reject,
        promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
    return {
        resolve,
        reject,
        promise,
    };
}
