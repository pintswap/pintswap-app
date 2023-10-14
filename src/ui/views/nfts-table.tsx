import { useOffersContext } from '../../stores';

export const NFTsTableView = () => {
    const { offersByChain } = useOffersContext();
    console.log('offersByChain', offersByChain.nft);
    return <></>;
};
