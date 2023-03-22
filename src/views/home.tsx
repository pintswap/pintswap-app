import { Card, Table } from '../components';

export const HomeView = () => {
    return (
        <div>
            <Card>
                <Table
                    items={[
                        {
                            'Something 1': 'bang',
                            'Something 2': '123',
                            'Something 3': 'John',
                        },
                        {
                            'Something 1': 'jeez',
                            'Something 2': '678',
                            'Something 3': 'Jones',
                        },
                        {
                            'Something 1': 'sheesh',
                            'Something 2': '890',
                            'Something 3': 'Ray',
                        },
                    ]}
                />
            </Card>
        </div>
    );
};
