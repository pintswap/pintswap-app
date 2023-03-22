import { useNavigate } from 'react-router-dom';
import { Button, Card, CopyClipboard, Table } from '../components';

export const HomeView = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Multi Address</p>
                <CopyClipboard value={'0x3...2kS'} icon lg />
            </div>
            <Card header="Open Trades" scroll>
                <Table
                    onClick={console.log}
                    items={[]}
                    emptyContent={
                        <span>
                            You currently have no open trades.{' '}
                            <a href="/create">Create a trade now!</a>
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
