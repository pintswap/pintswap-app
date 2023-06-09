import { ethers } from 'ethers6';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Button,
    Card,
    CopyClipboard,
    DataTable,
    DropdownInput,
    Input,
    Skeleton,
    TransitionModal,
} from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useOffersContext, useUserContext } from '../stores';
import { usePintswapContext } from '../stores/pintswap';
import { convertAmount } from '../utils/token';
import { Tab } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { truncate } from '../utils';

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
    },
];

export const AccountView = () => {
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const { pintswap } = usePintswapContext();
    const { userTrades } = useOffersContext();
    const {
        updateBio,
        updateImg,
        updateName,
        handleSave,
        updatePrivateKey,
        userData,
        toggleActive,
        useNft,
        toggleUseNft,
        setUseNft,
        loading,
    } = useUserContext();
    const { name, bio, img, privateKey, extension } = userData;

    const [shallowForm, setShallowForm] = useState({ bio, name });
    const [isEditing, setIsEditing] = useState(false);
    const [tableData, setTableData] = useState<any[]>([]);

    const handleUpdate = async (e: any) => {
        e.preventDefault();
        await handleSave();
        setShallowForm({ bio, name });
        setIsEditing(false);
    };

    const handleCancel = (e: any) => {
        e.preventDefault();
        updateBio({ target: { value: shallowForm.bio } });
        updateName({ target: { value: shallowForm.name } });
        setIsEditing(false);
    };

    useEffect(() => {
        (async () => {
            const tableDataRes = await Promise.all(
                Array.from(userTrades, async (entry) => ({
                    hash: entry[0],
                    sending: await convertAmount(
                        'readable',
                        entry[1].gives.amount || '',
                        entry[1].gives.token,
                        pintswap.module?.signer,
                    ),
                    receiving: await convertAmount(
                        'readable',
                        entry[1].gets.amount || '',
                        entry[1].gets.token,
                        pintswap.module?.signer,
                    ),
                })),
            );
            setTableData(tableDataRes);
        })().catch((err) => console.error(err));
    }, [userTrades.size]);

    const TABS = ['Profile', width > 600 ? 'Your Orders' : 'Orders'];
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <TransitionModal
                    button={
                        <Avatar
                            peer={pintswap?.module?.peerId.toB58String()}
                            align="left"
                            size={60}
                            type="profile"
                        />
                    }
                >
                    <Avatar peer={pintswap?.module?.peerId.toB58String()} size={300} />
                </TransitionModal>
                <div className="text-right hidden md:block">
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
                        <div
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 overflow-x-hidden`}
                        >
                            <div
                                className={`flex flex-col gap-3 lg:gap-5 justify-center items-center mt-4 mb-2 lg:my-0`}
                            >
                                {isEditing ? (
                                    <div
                                        className={`flex flex-col justify-center items-center gap-2 w-full`}
                                    >
                                        {useNft.using ? (
                                            <div
                                                className={`flex flex-col gap-2 justify-center items-center w-full`}
                                            >
                                                <Input
                                                    value={useNft.address}
                                                    onChange={(e) =>
                                                        setUseNft({
                                                            ...useNft,
                                                            address: e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    title="Address"
                                                    placeholder={'Start typing here'}
                                                    disabled={loading}
                                                    max={50}
                                                />
                                                <Input
                                                    value={useNft.id}
                                                    onChange={(e) =>
                                                        setUseNft({ ...useNft, id: e.target.value })
                                                    }
                                                    type="number"
                                                    title="ID"
                                                    placeholder={'Start typing here'}
                                                    disabled={loading}
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-0.5">
                                                <input
                                                    type="file"
                                                    name="profile-image"
                                                    accept=".jpg, .jpeg, .png"
                                                    onChange={updateImg}
                                                    className="absolute bg-transparent rounded-full h-[150px] w-[150px] text-transparent z-50 hover:cursor-pointer"
                                                />
                                                <span className="absolute h-[154px] w-[154px] -translate-x-0.5 translate-y-0.5">
                                                    <span className="flex justify-center items-center h-full w-full -top-1 relative rounded-full bg-[rgba(0,0,0,0.6)] text-center text-xs p-4">
                                                        Click to
                                                        <br />
                                                        Upload
                                                    </span>
                                                </span>
                                                <Avatar
                                                    size={150}
                                                    peer={pintswap?.module?.peerId.toB58String()}
                                                />
                                            </div>
                                        )}
                                        <Button
                                            className={`text-sm text-center ${
                                                useNft.using ? 'mt-5' : ''
                                            }`}
                                            type="outline"
                                            onClick={toggleUseNft}
                                            disabled={loading}
                                        >
                                            Use {useNft.using ? 'File' : 'NFT'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Avatar
                                        size={150}
                                        peer={pintswap?.module?.peerId.toB58String()}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 lg:gap-2">
                                <div className="flex items-end w-full">
                                    <Input
                                        value={
                                            isEditing
                                                ? name
                                                : name.includes('.drip')
                                                ? name
                                                : truncate(name)
                                        }
                                        onChange={updateName}
                                        type="text"
                                        title="Username"
                                        enableStateCss
                                        disabled={!isEditing || loading}
                                        placeholder={
                                            isEditing ? 'Start typing here...' : 'No username'
                                        }
                                        max={50}
                                        className={`!rounded-r-none`}
                                    />
                                    {isEditing && (
                                        <DropdownInput state={extension} type="input-ext" />
                                    )}
                                </div>
                                <Input
                                    value={bio}
                                    onChange={updateBio}
                                    type="text"
                                    title="Bio"
                                    enableStateCss
                                    disabled={!isEditing || loading}
                                    placeholder={isEditing ? 'Start typing here...' : 'No bio'}
                                    max={100}
                                />
                                <Input
                                    value={
                                        (!isEditing &&
                                            ((privateKey && privateKey.replace(/\w/g, '*')) ||
                                                '')) ||
                                        privateKey ||
                                        ''
                                    }
                                    onChange={updatePrivateKey}
                                    type="password"
                                    title="Private Key"
                                    enableStateCss
                                    disabled={!isEditing || loading}
                                    placeholder={
                                        isEditing ? 'Start typing here...' : 'No private key'
                                    }
                                    max={100}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-3 lg:gap-5 mt-3 lg:mt-5">
                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    form="reset"
                                    type="outline"
                                >
                                    Edit
                                </Button>
                            ) : (
                                <>
                                    <Button form="reset" onClick={handleCancel} type="transparent">
                                        Cancel
                                    </Button>
                                    <Button form="submit" onClick={handleUpdate} loading={loading}>
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Tab.Panel>
                <Tab.Panel>
                    <DataTable columns={columns} data={tableData} type="manage" toolbar={false} />
                </Tab.Panel>
            </Card>

            <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
                <Button onClick={() => navigate('/create')} className="sm:max-w-lg sm:self-center">
                    Create Order
                </Button>
                <Button
                    onClick={toggleActive}
                    className="sm:max-w-lg sm:self-center"
                    type="transparent"
                >
                    {userData.active ? 'Stop Publishing' : 'Publish Offers'}
                </Button>
            </div>
        </div>
    );
};
