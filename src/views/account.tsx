import { ethers } from 'ethers6';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CopyClipboard, Skeleton, Table } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useOffersContext } from '../stores';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';

export const AccountView = () => {
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const { pintswap } = useGlobalContext();
    const { openTrades } = useOffersContext();

    const TABS = ['Your Orders', 'Settings']

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center self-center">
                <p className="text-sm">Your Multi Address</p>
                <Skeleton loading={pintswap.loading}>
                    <CopyClipboard
                        value={pintswap?.module?.peerId.toB58String() || ethers.ZeroAddress}
                        truncate={5}
                        icon
                        lg={width > 768}
                    />
                </Skeleton>
            </div>
            <Tab.Group>
                <Card 
                    header={
                        <Tab.List className="grid grid-cols-2 gap-2 lg:gap-4">
                            {TABS.map((tab, i) => (
                                <Tab key={`tabs-${i}`}>
                                    {({ selected }) => (
                                        <button className={`${selected ? 'border-indigo-600' : 'border-transparent hover:border-neutral-800 hover:text-indigo-200'} border-b-2 lg:border-b-4 rounded w-full pb-2 transition duration-200`}>
                                            {tab}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                    }
                    scroll
                >
                    <Tab.Panels>
                        <Tab.Panel>
                            <Table
                                headers={['Hash', 'Sending', 'Receiving']}
                                onClick={(order: any) =>
                                    navigate(`/${pintswap?.module?.peerId.toB58String()}/${order.hash}`)
                                }
                                items={Array.from(openTrades, (entry) => ({
                                    hash: entry[0],
                                    gives: convertAmount('readable', (entry[1].gives.amount || ''), entry[1].gives.token),
                                    gets: convertAmount('readable', (entry[1].gets.amount || ''), entry[1].gets.token),
                                }))}
                                emptyContent={
                                    pintswap.loading ? (
                                        <ImSpinner9 className="animate-spin" size="20px" />
                                    ) : (
                                        <span>
                                            You currently have no open trades.{' '}
                                            <button onClick={() => navigate('/create')}>
                                                Create a trade now!
                                            </button>
                                        </span>
                                    )
                                }
                            />
                        </Tab.Panel>
                        <Tab.Panel>Settings</Tab.Panel>
                    </Tab.Panels>
                </Card>
            </Tab.Group>
            <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                Create Order
            </Button>
            
        </div>
    );
};
