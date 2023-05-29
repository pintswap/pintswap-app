import { IPintswapProps } from "../stores";
import { EMPTY_USER_DATA } from "./constants";
import { createFromB58String } from 'peer-id';
import { constants } from 'ethers';

export const formatPeerName = async (ps: IPintswapProps, peer: string) => {
  const { module } = ps;
  if(peer.includes('.drip')) return peer;
  else {
    try {
      const name = await module?.resolveName(peer);
      if(name) return name;
      else return peer;
    } catch (err) {
      console.warn(`#formatPeerName: no names found for multiAddr ${peer}`);
      return peer;
    }
  }
};

export async function getPeerData(ps: IPintswapProps, peer: string) {
  const { module } = ps;
  let formattedPeerAddress;
  try {
    if(peer.includes('.drip')) {
      formattedPeerAddress = await module?.resolveName(peer) || constants.AddressZero;
    } else {
      formattedPeerAddress = peer;
    }
    const b58peer = createFromB58String(formattedPeerAddress).toB58String();
    const res = formattedPeerAddress === module?.peerId.toB58String() ? module?.userData : await module?.getUserDataByPeerId(b58peer);
    if(res) return res;
    else return { offers: [], bio: '', image: '' };
  } catch (err) {
    console.warn("#getPeerData:", err);
    return { offers: [], bio: '', image: '' }
  }
}

export const getFormattedPeer = async (ps: IPintswapProps, peer: string) => {
  const baseUrl = `data:image/jpg;base64,`;
  try {
    const res = await getPeerData(ps, peer);
    console.log("res", res)
    const formattedName = await formatPeerName(ps, peer);
    if(res) {
      const renderPic = res.image.toString('base64') !== '' ?
       `${baseUrl}${res.image?.toString('base64')}` : '/black.jpg';
      return {
        img: renderPic,
        bio: res.bio,
        name: formattedName,
        privateKey: '',
        active: false,
        extension: '.drip'
      }
    }
  } catch (err) {
    return {
      ...EMPTY_USER_DATA,
      name: peer
    };
  }
} 