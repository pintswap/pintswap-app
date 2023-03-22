import { Card, CopyClipboard, Table } from '../components';

export const HomeView = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Multi Address</p>
                <CopyClipboard value={'0x3...2kS'} icon lg />
            </div>
            <Card header="Open Trades">
                <Table
                    onClick={console.log}
                    items={[
                        {
                            'Token Offered': 'ETH',
                            Amount: '123',
                        },
                        {
                            'Token Offered': 'WXRP',
                            Amount: '678',
                        },
                        {
                            'Token Offered': 'WBTC',
                            Amount: '890',
                        },
                    ]}
                />
            </Card>
        </div>
    );
};
