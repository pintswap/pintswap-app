import type { Pintswap } from '@pintswap/sdk';

export async function savePintswap(ps: Pintswap) {
    const signerAddress = await ps?.signer?.getAddress();
    window.localStorage.setItem(
        `_pintUser-${signerAddress}`,
        JSON.stringify(ps.toObject(), null, 2),
    );
    ps.logger.info('saved to localStorage!');
}
