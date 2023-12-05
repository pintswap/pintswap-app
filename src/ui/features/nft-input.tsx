import { useEffect, useState } from 'react';
import { useWindowSize } from '../../hooks';
import { INFTProps, getChainId, truncate } from '../../utils';
import { alchemy } from '../../config';
import { SelectNFT, SpinnerLoader } from '../components';
import { NFTDisplay } from './nft-display';
import { useAccount } from 'wagmi';
import { MdExpandMore } from 'react-icons/md';

type INFTInput = {
    label?: string;
    nftAddress?: string;
    onNftSelect: any;
    nftId?: string;
    disabled?: boolean;
    nftLoading?: boolean;
    nft?: INFTProps | null;
    type?: 'owner';
};

export const NFTInput = ({
    label,
    nftAddress,
    onNftSelect,
    nftId,
    disabled,
    nftLoading,
    nft,
    type = 'owner',
}: INFTInput) => {
    const { address } = useAccount();
    const chainId = getChainId();
    const { width, breakpoints } = useWindowSize();
    const [dropdownItems, setDropdownItems] = useState<INFTProps[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const handleSelected = (e: any) => {
        onNftSelect(e);
        setModalOpen(false);
    };

    useEffect(() => {
        (async () => {
            if (address && type === 'owner') {
                const res = await alchemy[chainId].nft.getNftsForOwner(address);
                if (res && res.ownedNfts?.length) {
                    setDropdownItems(
                        res.ownedNfts.map((n: any) => ({
                            image: n.media?.length
                                ? n?.media[0]?.gateway
                                : n.tokenUri?.gateway || n.tokenUri?.raw || '',
                            tokenId: n.tokenId,
                            name: n.title,
                            totalSupply: n.contract.totalSupply || '',
                            token: n.contract.address,
                            amount: String(n.balance),
                            description: n.description,
                        })),
                    );
                }
            }
        })().catch((err) => console.error(err));
    }, [address]);

    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-2 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div>
                <SelectNFT
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    selected={nft}
                    setSelected={handleSelected}
                    items={dropdownItems}
                    button={
                        <div
                            className={`flex justify-between items-center gap-4 pt-4 pb-1 transition duration-150 ${
                                !nft
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'hover:text-neutral-300 '
                            }`}
                        >
                            <span className="text-lg text-left w-full py-0.5">
                                {nftAddress
                                    ? truncate(nftAddress, 6)
                                    : `Click to select ${width > breakpoints.sm ? 'NFT' : ''}`}
                            </span>
                            <span className="text-lg cursor-pointer outline-none ring-0 bg-neutral-900 min-w-0 w-fit max-w-[80px] sm:max-w-[100px] !text-right py-0.5 pr-1.5">
                                {nftId || <MdExpandMore />}
                            </span>
                        </div>
                    }
                />
            </div>
            <div className="w-full flex items-center gap-2">
                <small className={`text-gray-400 flex items-center gap-0.5`}>
                    {nft?.name || '-'}
                </small>
                <div className="flex justify-center items-center w-[18px] h-[18px] overflow-hidden rounded-sm">
                    {nftLoading ? (
                        <div className="bg-neutral-800 rounded-sm w-full h-full flex items-center justify-center">
                            <SpinnerLoader size={'10px'} />
                        </div>
                    ) : nft ? (
                        <NFTDisplay nft={nft} show="img" />
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    );
};
