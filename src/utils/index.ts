export * from './constants';
export * from './local-storage';
export * from './mui';
export * from './nft';
export * from './orderbook';
export * from './peer';
export * from './provider';
export * from './toast';
export * from './token';
export * from './types';
export * from './wallet';
export * from './format';
export * from './math';

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
