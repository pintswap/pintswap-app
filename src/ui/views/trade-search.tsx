import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components';

type IFormProps = {
    multiAddr: string;
    orderHash: string;
};

/**
 * @deprecated
 */
export const TradeSearchView = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<IFormProps>({ multiAddr: '', orderHash: '' });

    const updateForm = (key: keyof IFormProps, val: string) => setForm({ ...form, [key]: val });

    return (
        <div className="flex flex-col">
            <h2 className="view-header text-left">Search</h2>
            <Card>
                <form className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-6">
                    <Input
                        title="Peer Address"
                        placeholder="Qw...123A"
                        value={form.multiAddr}
                        onChange={(e) => updateForm('multiAddr', e.currentTarget.value)}
                    />
                    <Input
                        title="Order Hash"
                        placeholder="0x...123A"
                        value={form.orderHash}
                        onChange={(e) => updateForm('orderHash', e.currentTarget.value)}
                    />
                    <Button
                        form="submit"
                        disabled={!form.multiAddr}
                        onClick={() =>
                            navigate(
                                form.orderHash
                                    ? `/fulfill/${form.multiAddr}/${form.orderHash}`
                                    : `/fulfill/${form.multiAddr}`,
                            )
                        }
                        className="xl:col-span-2"
                    >
                        Search
                    </Button>
                </form>
            </Card>
        </div>
    );
};
