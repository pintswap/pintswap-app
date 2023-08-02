import {
    Avatar,
    Card,
    NFTTable,
    DataTable,
    TransitionModal,
    DropdownMenu,
    Button,
} from '../components';
import { useTrade } from '../hooks/trade';
import { useLocation, useParams } from 'react-router-dom';
import { useWindowSize } from '../hooks/window-size';
import { FaChevronDown } from 'react-icons/fa';
import { useDropdown } from '../hooks/dropdown';
import { useLimitOrders } from '../hooks';
import { PairsTable } from '../components/pairs-table';

export const PeerOrderbookView = () => {
    const { width, breakpoints } = useWindowSize();
    const { handleCurrentClick, items, currentIndex } = useDropdown(
        [{ text: 'All' }, { text: 'NFTs' }, { text: 'Pairs' }],
        0,
        true,
    );
    const { order, loading } = useTrade();
    const { filteredNfts } = useLimitOrders('peer-orderbook');
    const { state } = useLocation();
    const { multiaddr } = useParams();

    const peer = state?.peer ? state.peer : multiaddr ? multiaddr : order.multiAddr;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <TransitionModal
                    button={
                        <Avatar
                            peer={peer}
                            withBio
                            withName
                            align="left"
                            size={60}
                            type="profile"
                        />
                    }
                >
                    <Avatar peer={peer} size={300} />
                </TransitionModal>
                <DropdownMenu
                    customIcon={
                        <span className="flex items-center gap-1 md:gap-2 py-2 text-md">
                            {items[currentIndex].text} <FaChevronDown />
                        </span>
                    }
                    items={items}
                    onClick={handleCurrentClick}
                />
            </div>

            <Card>
                <div
                    className={`${
                        currentIndex === 0 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <div className="flex flex-col gap-3">
                        <span className="text-lg">Pairs</span>
                        <PairsTable />
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-lg">NFTs</span>
                        <NFTTable
                            data={filteredNfts.slice(0, width > breakpoints.lg ? 3 : 2)}
                            peer={order.multiAddr}
                            loading={loading.allTrades}
                        />
                        {filteredNfts.length > 2 && (
                            <Button
                                onClick={() => handleCurrentClick('nfts')}
                                className="w-fit self-center"
                                type="outline"
                            >
                                See All NFTs
                            </Button>
                        )}
                    </div>
                </div>
                <div
                    className={`${
                        currentIndex === 1 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <span className="text-lg">NFTs</span>
                    <NFTTable
                        data={filteredNfts}
                        peer={order.multiAddr}
                        loading={loading.allTrades}
                        paginated
                    />
                    <Button
                        onClick={() => handleCurrentClick('all')}
                        className="w-fit self-center"
                        type="outline"
                    >
                        Back to All
                    </Button>
                </div>
                <div
                    className={`${
                        currentIndex === 2 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <span className="text-lg">Pairs</span>
                    <PairsTable />
                    <Button
                        onClick={() => handleCurrentClick('all')}
                        className="w-fit self-center"
                        type="outline"
                    >
                        Back to All
                    </Button>
                </div>
            </Card>
        </div>
    );
};
