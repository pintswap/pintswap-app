import { NFTPFP } from '@pintswap/sdk';
import { IPintswapProps, IUserDataProps } from '../stores';
import { BASE_AVATAR_URL, DEFAULT_AVATAR, EMPTY_USER_DATA } from './constants';
import { createFromB58String } from 'peer-id';

export const peerCache: any = {};

export const formatPeerImg = (img: string | Buffer | NFTPFP) => {
    if (!img || img.toString('base64').length === 0) return DEFAULT_AVATAR;
    if (typeof img === 'string' && img.startsWith('data:image')) return img;
    return `${BASE_AVATAR_URL}${img.toString('base64')}`;
};

export const getPeerImg = async (ps: IPintswapProps, peer: string | IUserDataProps) => {
    if (typeof peer === 'string') {
        const { image } = await getPeerData(ps, peer);
        return formatPeerImg(image);
    }
    const b58peer = await formatPeerName(ps, (peer as IUserDataProps).name, true);
    const { image } = await getPeerData(ps, b58peer);
    return formatPeerImg(image);
};

export const formatPeerName = async (ps: IPintswapProps, peer: string, inverse?: boolean) => {
    const { module } = ps;
    try {
        if (inverse) {
            if (peer.includes('.drip')) {
                const b58 = await module?.resolveName(peer);
                return b58 ? b58 : peer;
            } else {
                return peer;
            }
        } else {
            if (peer.includes('.drip')) return peer;
            const name = await module?.resolveName(peer);
            if (name) return name;
            else return peer;
        }
    } catch (err) {
        return peer;
    }
};

export async function getPeerData(ps: IPintswapProps, peer: string, type?: 'full' | 'minimal') {
    const { module } = ps;
    if (!module) return { offers: [], bio: '', image: '' };
    try {
        const formattedPeerAddress = await formatPeerName(ps, peer, true);

        let res;
        if (formattedPeerAddress === module.address) {
            res = module?.userData;
        } else {
            if (type === 'minimal') {
                return {
                    offers: [],
                    bio: module?.peers.get(`${formattedPeerAddress}::bio`),
                    image: '',
                };
            } else {
                res = await module?.getUserData(formattedPeerAddress);
            }
        }
        if (res) return res;
        else return { offers: [], bio: '', image: '' };
    } catch (err) {
        console.warn('#getPeerData:', err);
        return { offers: [], bio: '', image: '' };
    }
}

export const getFormattedPeer = async (
    ps: IPintswapProps,
    peer: string,
    type?: 'full' | 'minimal',
) => {
    try {
        if (peerCache[peer]) return peerCache[peer];
        const res = await getPeerData(ps, peer, type);
        const returnObj = {
            img: formatPeerImg(res.image),
            bio: res.bio,
            name: await formatPeerName(ps, peer),
            privateKey: '',
            active: false,
            extension: '.drip',
        };
        peerCache[peer] = returnObj;
        return returnObj;
    } catch (err) {
        return {
            ...EMPTY_USER_DATA,
            name: peer,
        };
    }
};
