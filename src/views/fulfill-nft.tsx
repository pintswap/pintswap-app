import { Transition } from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers6';
import { toast } from 'react-toastify';
import { fetchNFT } from '../utils/fetch-nft';
import {
    Avatar,
    Button,
    Card,
    CopyClipboard,
    PageStatus,
    Input,
    ProgressIndicator,
} from '../components';
import { DropdownInput } from '../components/dropdown-input';
import { useTrade } from '../hooks/trade';
import { useOffersContext, useGlobalContext } from '../stores';
import { BASE_URL } from '../utils/common';
import { orderTokens, getDecimals, fromFormatted, toLimitOrder } from '../utils/orderbook';
import { useSigner, useAccount } from 'wagmi';
import { hashOffer } from '@pintswap/sdk';
import { useParams } from 'react-router-dom';
import { toFormatted } from '../utils/orderbook';

export const FulfillNFTView = () => {
    const { multiaddr, hash } = useParams();
    const multiaddrCast = multiaddr as string;
    const hashCast = hash as string;
    const { peerTrades } = useOffersContext();
    const { fulfillTrade, steps, error } = useTrade();
    const [loading, setLoading] = useState(true);
    const { data: signer } = useSigner();
    const offer = useMemo(() => {
        return peerTrades.get(hashCast);
    }, [peerTrades, hash, multiaddr]);
    const [nft, setNFT] = useState(null);
    useEffect(() => {
        (async () => {
            if (offer) {
                const n = await fetchNFT(offer.gives);
                const cost = await toFormatted(offer.gets, signer);
                setLoading(false);
                setNFT({ ...n, ...cost });
            }
        })().catch((err) => console.error(err));
    }, [offer]);
    const imageBlob = useMemo(
        () => nft && URL.createObjectURL((nft as any).imageBlob),
        [nft],
    ) as any;
    const nftCast = nft as any;
    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
                <Avatar peer={multiaddrCast} withBio withName nameClass="text-xl" type="profile" />
                <Card header={'Buy NFT'}>
                    {nftCast && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                            <img src={imageBlob} />
                            <div>{nftCast.name}</div>
                            <div>{nftCast.description}</div>
                            <div>{`${Number(nftCast.amount).toFixed(4)}} ${nftCast.token}`}</div>
                        </div>
                    )}
                    <Button
                        checkNetwork
                        className="mt-6 w-full"
                        loadingText="Fulfilling"
                        onClick={fulfillTrade}
                        disabled={!nftCast || loading}
                    >
                        Fulfill Trade
                    </Button>
                </Card>

                <div className="mx-auto">
                    <ProgressIndicator steps={steps} />
                </div>
            </div>
            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
