import { Transition } from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Card, PageStatus, SpinnerLoader } from '../components';
import { Avatar, NFTDisplay } from '../features';
import { useTrade } from '../../hooks';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { INFTProps, toFormatted, fetchNFT, updateToast } from '../../utils';
import { usePintswapContext } from '../../stores';

export const FulfillNFTView = () => {
    const navigate = useNavigate();
    const { multiaddr, hash } = useParams();
    const { state } = useLocation();
    const { fulfillTrade, steps, error, peerTrades } = useTrade();
    const [loading, setLoading] = useState(true);
    const [nft, setNFT] = useState<INFTProps | null>(null);
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();

    const offer = useMemo(() => {
        return peerTrades.get(hash as string);
    }, [peerTrades, hash, multiaddr]);

    useEffect(() => {
        (async () => {
            if (offer) {
                updateToast('loading-fulfill-nft', 'success', 'Connected to peer');
                const n = await fetchNFT(offer.gives);
                const cost = await toFormatted(offer.gets, chainId);
                setLoading(false);
                setNFT({ ...n, ...cost });
            }
        })().catch((err) => console.error(err));
    }, [offer]);

    useEffect(() => {
        updateToast('loading-fulfill-nft', 'pending', 'Connecting to peer');
    }, []);

    const peer = state?.peer ? state.peer : multiaddr;

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-3 2xl:gap-4 max-w-3xl mx-auto">
                <button onClick={() => navigate(`/${multiaddr}`)} className="w-fit text-left">
                    <Avatar peer={peer} withBio withName align="left" size={60} type="profile" />
                </button>
                <Card header={'Buy NFT'}>
                    <NFTDisplay
                        nft={nft}
                        show="full"
                        height="h-auto sm:h-60"
                        width="w-auto sm:w-60"
                        offer={offer}
                        loading={loading}
                    />
                    <Button
                        checkNetwork
                        className="mt-6 w-full"
                        loadingText="Fulfilling"
                        onClick={fulfillTrade}
                        disabled={!nft || loading}
                    >
                        Buy
                    </Button>
                </Card>
            </div>

            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
