import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Card, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';

export const PeerOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, availableTrades } = useGlobalContext();
    const { error, order } = useTrade();
    
    return (
        <div className="flex flex-col gap-6">
            <Card header="Open Trades" scroll>
                {/* TODO */}
                <Table
                    headers={['Peer', 'Sending', 'Receiving']}
                    onClick={(trade: any) => navigate(`/${trade.multiAddr}/${trade.hash}`)}
                    items={Array.from(availableTrades, (entry) => ({ 
                        peer: entry[0],
                        gives: convertAmount('readable', entry[1].givesAmount, entry[1].givesToken),
                        gets: convertAmount('readable', entry[1].getsAmount, entry[1].getsToken)
                    }))}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? 
                                    <span>Error loading available trades.{" "}
                                        <button onClick={() => navigate(0)} className="text-indigo-600 transition duration-200 hover:text-indigo-700">Try refreshing.</button>
                                    </span> : 
                                    "Loading available trades..."
                                }
                            </span>
                        )
                    }
                />
            </Card>
        </div>
    );
};
