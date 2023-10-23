import { Pintswap } from '@pintswap/sdk';

/* eslint-disable no-restricted-globals */
/* eslint-disable no-native-reassign */
self.onmessage = async (e) => {
    const { type, trade, peer, module } = JSON.parse(e.data);
    console.log('module', module);

    //   const copiedPintswapObject = (await Pintswap.fromPassword({
    //     signer: module.signer,
    //     password: await module.signer?.getAddress(),
    // } as any)) as Pintswap;

    switch (type) {
        case 'batch':
            module.createBatchTrade(peer, trade);
            break;
        case 'nft':
            module.createTrade(peer, trade);
            break;
        default:
            module.createTrade(peer, trade);
            break;
    }
    self.postMessage('trade:initiated');
};
