import { NFTPFP } from '@pintswap/sdk';
import { IPintswapProps, IUserDataProps } from '../stores';
import { BASE_AVATAR_URL, DEFAULT_AVATAR, EMPTY_USER_DATA, TESTING } from './constants';
import { createFromB58String } from 'peer-id';

export const formatPeerImg = (img: string | Buffer | NFTPFP) => {
    if (TESTING) console.log('#formatPeerImg:', img);
    if (!img || img === BASE_AVATAR_URL || img.toString('base64').length === 0)
        return DEFAULT_AVATAR;
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
            // TODO: make sure this inverse works
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
        console.warn(`#formatPeerName: no names found for multiAddr ${peer}`);
        return peer;
    }
};

export async function getPeerData(ps: IPintswapProps, peer: string, type?: 'full' | 'minimal') {
    const { module } = ps;
    try {
        const formattedPeerAddress = await formatPeerName(ps, peer, true);
        const b58peer = createFromB58String(formattedPeerAddress).toB58String();

        let res;
        if (formattedPeerAddress === module?.peerId.toB58String()) {
            res = module?.userData;
        } else {
            if (type === 'minimal') {
                return {
                    offers: [],
                    bio: module?.peers.get(`${b58peer}::bio`),
                    image: '',
                };
            } else {
                res = await module?.getUserDataByPeerId(b58peer);
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
    const baseUrl = `data:image/jpg;base64,`;
    try {
        const res = await getPeerData(ps, peer, type);
        const formattedName = await formatPeerName(ps, peer);
        if (res) {
            const renderPic = formatPeerImg(res.image);
            return {
                img: renderPic,
                bio: res.bio,
                name: formattedName,
                privateKey: '',
                active: false,
                extension: '.drip',
            };
        }
    } catch (err) {
        return {
            ...EMPTY_USER_DATA,
            name: peer,
        };
    }
};
