import { useState } from 'react';
import { Button, Card, Input } from '../components';
import { EMPTY_TRADE, ITradeProps } from '../utils/common';

export const CreateView = () => {
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Create Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Input
                        title="In Details"
                        max={8}
                        placeholder="Token to Trade"
                        value={trade['Input Token']}
                        onChange={(e) =>
                            setTrade({
                                ...trade,
                                'Input Token': e.currentTarget.value.toUpperCase(),
                            })
                        }
                    />
                    <Input
                        placeholder="Amount to Trade"
                        value={trade['Input Amount']}
                        onChange={(e) =>
                            setTrade({
                                ...trade,
                                'Input Amount': e.currentTarget.value.toUpperCase(),
                            })
                        }
                        type="number"
                    />
                    <Input
                        title="Out Details"
                        max={8}
                        placeholder="Token to Recieve"
                        value={trade['Output Token']}
                        onChange={(e) =>
                            setTrade({
                                ...trade,
                                'Output Token': e.currentTarget.value.toUpperCase(),
                            })
                        }
                    />
                    <Input
                        placeholder="Amount to Receive"
                        value={trade['Output Amount']}
                        onChange={(e) =>
                            setTrade({
                                ...trade,
                                'Output Token': e.currentTarget.value.toUpperCase(),
                            })
                        }
                    />
                </div>
                <Button className="mt-6 w-full">Broadcast Trade</Button>
            </Card>
        </div>
    );
};
