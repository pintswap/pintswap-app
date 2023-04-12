import { ethers } from 'ethers';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CopyClipboard, Skeleton, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';

export const ViewOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, peerTrades } = useGlobalContext();
    const { error, order } = useTrade();
    
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Multi Address</p>
                <Skeleton loading={pintswap.loading}>
                    <CopyClipboard value={order.multiAddr || ethers.constants.AddressZero} truncate={5} icon lg />
                </Skeleton>
            </div>
            <Card header="Open Trades" scroll>
                <Table
                    headers={['Hash', 'Sending', 'Receiving']}
                    onClick={(trade: any) => navigate(`/${order.multiAddr}/${trade.hash}`)}
                    items={Array.from(peerTrades, (entry) => ({ 
                        hash: entry[0],
                        gives: convertAmount('readable', entry[1].givesAmount, entry[1].givesToken),
                            // `${entry[1].givesAmount} ${entry[1].givesToken}`,
                        gets: convertAmount('readable', entry[1].getsAmount, entry[1].getsToken)
                        // `${entry[1].getsAmount} ${entry[1].getsToken}`,
                    }))}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? 
                                    <span>Error loading peer&apos;s trades.{" "}
                                        <button onClick={() => navigate(0)} className="text-indigo-600 transition duration-200 hover:text-indigo-700">Try refreshing.</button>
                                    </span> : 
                                    "Loading peer's trades..."
                                }
                            </span>
                        )
                    }
                />
            </Card>
        </div>
    );
};
