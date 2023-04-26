import { Transition } from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchNFT } from '../utils/fetch-nft';
import {
    Avatar,
    Button,
    Card,
    NFTDisplay,
    PageStatus,
    ProgressIndicator,
    SpinnerLoader,
} from '../components';
import { useTrade } from '../hooks/trade';
import { useOffersContext } from '../stores';
import { useSigner } from 'wagmi';
import { useNavigate, useParams } from 'react-router-dom';
import { toFormatted } from '../utils/orderbook';
import { INFTProps } from '../utils/common';

export const FulfillNFTView = () => {
    const navigate = useNavigate();
    const { multiaddr, hash } = useParams();
    const { peerTrades } = useOffersContext();
    const { fulfillTrade, steps, error } = useTrade();
    const [loading, setLoading] = useState(true);
    const { data: signer } = useSigner();
    const [nft, setNFT] = useState<INFTProps | null>(null);

    const offer = useMemo(() => {
        return peerTrades.get(hash as string);
    }, [peerTrades, hash, multiaddr]);

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
    
    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
                <button onClick={() => navigate(`/${multiaddr}`)} className="w-fit text-left">
                    <Avatar peer={multiaddr} withBio withName nameClass="text-xl" type="profile" size={60} />
                </button>
                <Card header={'Buy NFT'}>
                    {loading ? (
                        <SpinnerLoader height="min-h-96" />
                    ) : (
                    <NFTDisplay 
                        nft={nft} 
                        show="full" 
                        height="h-96"
                    />
                    )}
                    <Button
                        checkNetwork
                        className="mt-6 w-full"
                        loadingText="Fulfilling"
                        onClick={fulfillTrade}
                        disabled={!nft || loading}
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
