import { ethers } from 'ethers6';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, CopyClipboard, DataTable, Input, Skeleton, TransitionModal } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useOffersContext, useUserContext } from '../stores';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';
import { Tab } from '@headlessui/react';
import { useState } from 'react';

const columns = [
    {
        name: 'hash',
        label: 'Hash',
    },
    {
        name: 'sending',
        label: 'Sending',
    },
    {
        name: 'receiving',
        label: 'Receiving',
    },
    {
        name: '',
        label: '',
    }
];

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

    const TABS = ['Profile', width > 600 ? 'Your Orders' : 'Orders']
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <TransitionModal button={<Avatar peer={pintswap?.module?.peerId.toB58String()} withBio withName align="left" size={60} type="profile" />}>
                    <Avatar peer={pintswap?.module?.peerId.toB58String()} size={300} />
                </TransitionModal>
                <div className="text-right">
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
            </div>
            <Card tabs={TABS} type="tabs" scroll>
                <Tab.Panel>
                    <form>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 overflow-x-hidden`}>
                        <div className={`flex flex-col gap-3 lg:gap-5 justify-center items-center mt-4 mb-2 lg:my-0`}>
                            {isEditing ? (
                                <div className="p-0.5">
                                <input
                                type="file"
                                name="profile-image"
                                accept=".jpg, .jpeg, .png"
                                onChange={updatePic}
                                // className="block w-full py-1 text-xs border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-neutral-700 border-neutral-700 dark:placeholder-gray-400"
                                className="absolute bg-transparent rounded-full h-[150px] w-[150px] text-transparent z-50 hover:cursor-pointer"
                                title=" "
                                />
                                    <span className="absolute h-[130px] w-[130px]">
                                        <span className="flex justify-center items-center h-full w-full -top-1 relative rounded-full bg-[rgba(0,0,0,0.6)] text-center text-xs p-4">
                                            Click to Upload
                                        </span>
                                    </span>
                                    <Avatar size={150} />
                                </div>
                            ) : (
                                <div>
                                    <Avatar size={150} type="clickable" />
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
                                    enableStateCss
                                    disabled={!isEditing}
                                    placeholder={isEditing ? 'Start typing here...' : 'No username'}
                                    max={50}
                                />
                            </div>
                            <div>
                                <Input 
                                    value={bio}
                                    onChange={updateBio}
                                    type="text"
                                    title='Bio'
                                    enableStateCss
                                    disabled={!isEditing}
                                    placeholder={isEditing ? 'Start typing here...' : 'No bio'}
                                    max={100}
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
                <Tab.Panel>
                    <DataTable 
                        columns={columns}
                        data={Array.from(openTrades, (entry) => ({
                            hash: entry[0],
                            sending: convertAmount('readable', (entry[1].gives.amount || ''), entry[1].gives.token),
                            receiving: convertAmount('readable', (entry[1].gets.amount || ''), entry[1].gets.token),
                        }))}
                        type="manage"
                        toolbar={false}
                    />
                </Tab.Panel>
            </Card>
            <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                Create Order
            </Button>
            
        </div>
    );
};
