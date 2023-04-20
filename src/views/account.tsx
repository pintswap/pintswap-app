import { ethers } from 'ethers6';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, CopyClipboard, Input, Skeleton, Table } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useOffersContext, useUserContext } from '../stores';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';
import { Tab, Transition } from '@headlessui/react';
import { useState } from 'react';

export const AccountView = () => {
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const { pintswap } = useGlobalContext();
    const { openTrades } = useOffersContext();
    const { bio, shortAddress, updateBio, updatePic, updateShortAddress, handleSave, profilePic } = useUserContext();
    const [shallowForm, setShallowForm] = useState({ bio, shortAddress })
    const [isEditing, setIsEditing] = useState(bio || shortAddress || profilePic ? false : true);

    const handleUpdate = () => {
        handleSave();
        setShallowForm({ bio, shortAddress })
        setIsEditing(false);
    };

    const handleCancel = () => {
        updateBio({ target:{ value: shallowForm.bio }});
        updateShortAddress({ target:{ value: shallowForm.shortAddress }})
        setIsEditing(false);
    }

    const TABS = [width > 600 ? 'Your Orders' : 'Orders', 'Settings']
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
                                <Tab key={`tabs-${i}`} className="focus-visible:outline-none">
                                    {({ selected }) => (
                                        <button className={`${selected ? 'border-indigo-600' : 'border-transparent hover:border-neutral-800 hover:text-indigo-100'} border-b-2 lg:border-b-4 rounded w-full pb-2 transition duration-200`}>
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
                        <Tab.Panel>
                            <form>
                            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 overflow-x-hidden`}>
                                <div className={`flex flex-col gap-3 lg:gap-5 justify-center items-center mt-4 mb-2`}>
                                    {isEditing ? (
                                        <div className="p-0.5">
                                        <input
                                        type="file"
                                        name="profile-image"
                                        accept=".jpg, .jpeg, .png"
                                        onChange={updatePic}
                                        // className="block w-full py-1 text-xs border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-neutral-700 border-neutral-700 dark:placeholder-gray-400"
                                        className="absolute bg-transparent rounded-full h-[125px] w-[125px] text-transparent z-50 hover:cursor-pointer"
                                        title=" "
                                        />
                                            <span className="absolute h-[130px] w-[130px]">
                                                <span className="flex justify-center items-center h-full w-full -top-1 relative rounded-full bg-[rgba(0,0,0,0.6)] text-center text-xs p-4">
                                                    Click to Upload
                                                </span>
                                            </span>
                                            <Avatar size={125} />
                                        </div>
                                    ) : (
                                        <div>
                                            <Avatar size={125} clickable />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3 lg:gap-0">
                                    <div>
                                        <Input 
                                            value={shortAddress}
                                            onChange={updateShortAddress}
                                            type="text"
                                            title='Username'
                                            enableStateCss={!!shortAddress}
                                            disabled={!isEditing}
                                            placeholder={isEditing ? 'Start typing here...' : 'No username'}
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            value={bio}
                                            onChange={updateBio}
                                            type="text"
                                            title='Bio'
                                            enableStateCss={!!bio}
                                            disabled={!isEditing}
                                            placeholder={isEditing ? 'Start typing here...' : 'No bio'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-3 lg:gap-5 mt-3 lg:mt-5">
                                {!isEditing ? <Button onClick={() => setIsEditing(true)} form="reset" type='outline'>Edit</Button> : (
                                    <>
                                    <Button form="reset" onClick={handleCancel} type='transparent'>Cancel</Button>
                                    <Button form="submit" onClick={handleUpdate}>Save</Button>
                                    </>
                                )}
                                </div>
                                </form>
                        </Tab.Panel>
                    </Tab.Panels>
                </Card>
            </Tab.Group>
            <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                Create Order
            </Button>
            
        </div>
    );
};
