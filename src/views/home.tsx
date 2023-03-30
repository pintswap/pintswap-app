import { ethers } from 'ethers';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CopyClipboard, Skeleton, Table } from '../components';
import { usePeerContext } from '../stores';
import { useGlobalContext } from '../stores/global';

export const HomeView = () => {
    const navigate = useNavigate();
    const { openTrades, pintswap, pintswapLoading } = useGlobalContext();
    const { peer } = usePeerContext();
    
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Peer ID</p>
                <Skeleton loading={pintswapLoading}>
                    <CopyClipboard value={peer.id || ethers.constants.AddressZero} isTruncated icon lg />
                </Skeleton>
            </div>
            <Card header="Open Trades" scroll>
                <Table
                    headers={['In Token', 'In Amount', 'Out Token', 'Out Amount']}
                    onClick={console.log}
                    items={Array.from(openTrades, (entry) => ({ 
                        inToken: entry[1].givesToken,
                        inAmount: entry[1].givesAmount,
                        outToken: entry[1].getsToken,
                        outAmount: entry[1].getsAmount
                    }))}
                    emptyContent={
                        pintswapLoading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                You currently have no open trades.{' '}
                                <button onClick={() => navigate('/create')}>Create a trade now!</button>
                            </span>
                        )
                    }
                />
            </Card>
            <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                Create Order
            </Button>
        </div>
    );
};
