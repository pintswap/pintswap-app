/* eslint-disable no-restricted-globals */
self.onmessage = (e) => {
    console.log('data', e.data);
    // const { type, trade, peer, module } = JSON.parse(e.data);
    // switch(type) {
    //   case 'batch':
    //     module.createBatchTrade(peer, trade);
    //     break;
    //   case 'nft':
    //     module.createTrade(peer, trade);
    //     break;
    //   default:
    //     module.createTrade(peer, trade);
    //     break;
    // }
    self.postMessage('trade:initiated');
};
