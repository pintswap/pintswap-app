import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Card, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';

export const ActiveOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, availableTrades } = useGlobalContext();
    const { error } = useTrade();
    
    return (
        <div className="flex flex-col gap-6">
            <Card header="Open Trades" scroll>
                {/* TODO */}
                <Table
                    headers={['Peer', 'Sending', 'Receiving']}
                    onClick={(trade: any) => navigate(`/${trade.peer}`)}
                    items={Array.from(availableTrades, (entry: any) => { 
                        let peer = entry[0];
                        let offer = entry[1][1][0];
                        return {
                            peer: entry[0],
                            gives: convertAmount('readable', offer.givesAmount, offer.givesToken),
                            gets: convertAmount('readable', offer.getsAmount, offer.getsToken)
                        }
                    })}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? 
                                    (<span>Error loading available offers.{" "}
                                        <button onClick={() => navigate(0)} className="text-indigo-600 transition duration-200 hover:text-indigo-700">Try refreshing.</button>
                                    </span>) : 
                                    availableTrades.size === 0 ? 'No active offers' : "Loading available offers..."
                                }
                            </span>
                        )
                    }
                />
            </Card>
        </div>
    );
};
