import { useNavigate } from 'react-router-dom';
import { Button, Card, CopyClipboard, Table } from '../components';
import { useGlobalContext } from '../stores/global';

export const HomeView = () => {
    const navigate = useNavigate();
    const { openTrades } = useGlobalContext();
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Multi Address</p>
                <CopyClipboard value={'0x3...2kS'} icon lg />
            </div>
            <Card header="Open Trades" scroll>
                <Table
                    onClick={console.log}
                    items={openTrades}
                    emptyContent={
                        <span>
                            You currently have no open trades.{' '}
                            <button onClick={() => navigate('/create')}>Create a trade now!</button>
                        </span>
                    }
                />
            </Card>
            <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                Create Order
            </Button>
        </div>
    );
};
