import { useOffersContext } from '../../stores';

/**
 * @TODO
 */
export const NFTsTableView = () => {
    const { offersByChain } = useOffersContext();
    console.log('offersByChain', offersByChain.nft);
    return <></>;
};
