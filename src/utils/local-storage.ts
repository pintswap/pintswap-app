import type { Pintswap } from '@pintswap/sdk';

export function savePintswap(ps: Pintswap) {
    window.localStorage.setItem('_pintUser', JSON.stringify(ps.toObject(), null, 2));
    ps.logger.info('saved to localStorage!');
}
