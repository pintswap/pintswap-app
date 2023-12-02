import { ethers, formatUnits } from 'ethers6';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    CopyClipboard,
    Input,
    Skeleton,
    TooltipWrapper,
    TransitionModal,
} from '../components';
import { Avatar } from '../features';
import { DataTable } from '../tables';
import { useOffersContext, useUserContext, usePintswapContext } from '../../stores';
import { Tab } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { formatPeerImg, convertAmount, IUserHistoryItemProps, getChainId } from '../../utils';
import { useAccountForm, useSubgraph, useWindowSize } from '../../hooks';
import { detectTradeNetwork } from '@pintswap/sdk';
import { FadeIn } from '../transitions';

const activeColumns = [
    {
        name: 'hash',
        label: 'Hash',
        options: {
            sort: false,
        },
    },
    {
        name: 'chainId',
        label: 'Chain',
    },
    {
        name: 'sending',
        label: 'Sending',
        options: {
            sort: false,
            setCellHeaderProps: () => ({ align: 'right' }),
        },
    },
    {
        name: 'receiving',
        label: 'Receiving',
        options: {
            sort: false,
            setCellHeaderProps: () => ({ align: 'right' }),
        },
    },
    {
        name: '',
        label: '',
    },
];

const historyColumns = [
    {
        name: 'timestamp',
        label: 'Date',
        options: {
            sort: false,
        },
    },
    {
        name: 'chainId',
        label: 'Chain',
    },
    {
        name: 'sending',
        label: 'Sending',
        options: {
            sort: false,
            setCellHeaderProps: () => ({ align: 'right' }),
        },
    },
    {
        name: 'receiving',
        label: 'Receiving',
        options: {
            sort: false,
            setCellHeaderProps: () => ({ align: 'right' }),
        },
    },
    {
        name: '',
        label: '',
    },
];

const TABS = ['Profile', 'Offers', 'History'];

export const AccountView = () => {
    const subgraph = useSubgraph({});
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { pintswap, incorrectSigner, signIfNecessary } = usePintswapContext();
    const chainId = getChainId();
    const { userTrades, deleteAllTrades } = useOffersContext();
    const { userData, toggleActive, offers } = useUserContext();
    const {
        shallowForm,
        updateShallow,
        handleSave,
        handleCancel,
        useNft,
        setUseNft,
        isLoading,
        isEditing,
        setIsEditing,
        isError,
        imgFile,
        toggleUseNft,
    } = useAccountForm();

    const [tableData, setTableData] = useState<any[]>([]);
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        (async () => {
            const tableDataRes = await Promise.all(
                Array.from(userTrades, async (entry) => {
                    const isSendingNft = entry[1].gives?.tokenId ? true : false;
                    const isReceivingNft = entry[1].gets?.tokenId ? true : false;
                    const chainId = await detectTradeNetwork(entry[1]);
                    return {
                        hash: entry[0],
                        chainId,
                        sending: await convertAmount(
                            'readable',
                            isSendingNft
                                ? formatUnits(entry[1].gives.tokenId || '', 0)
                                : entry[1].gives.amount || '',
                            entry[1].gives.token,
                            chainId,
                            isSendingNft,
                        ),
                        receiving: await convertAmount(
                            'readable',
                            isReceivingNft
                                ? formatUnits(entry[1].gets.tokenId || '', 0)
                                : entry[1].gets.amount || '',
                            entry[1].gets.token,
                            chainId,
                            isReceivingNft,
                        ),
                        isNftOffer: isSendingNft,
                    };
                }),
            );
            setTableData(tableDataRes);
        })().catch((err) => console.error(err));
    }, [userTrades.size]);

    useEffect(() => {
        if (state?.tab) {
            setCurrentTab(TABS.indexOf(state?.tab));
        }
    }, [state?.tab]);

    return (
        <div className="flex flex-col gap-3 sm:gap-4 2xl:gap-6">
            <div className="flex items-center justify-between">
                <TransitionModal
                    button={
                        <Avatar
                            peer={pintswap?.module?.address}
                            align="left"
                            size={60}
                            type="profile"
                        />
                    }
                >
                    <Avatar peer={pintswap?.module?.address} size={300} />
                </TransitionModal>
                <div className="text-right hidden md:block">
                    <p className="text-sm">Your Multi Address</p>
                    <Skeleton loading={pintswap.loading}>
                        <CopyClipboard
                            value={pintswap?.module?.address || ethers.ZeroAddress}
                            truncate={5}
                            icon
                            lg={width > 768}
                        />
                    </Skeleton>
                </div>
            </div>
            <Card
                tabs={TABS}
                defaultTab={state?.tab && state?.tab}
                type="tabs"
                rightButton={
                    currentTab === 1 &&
                    offers > 0 && (
                        <button
                            onClick={deleteAllTrades}
                            className="text-red-400 transition duration-150 hover:text-red-500"
                        >
                            Cancel All
                        </button>
                    )
                }
                onTabChange={(i: number) => setCurrentTab(i)}
            >
                <Tab.Panel>
                    <form>
                        <div
                            className={`grid grid-cols-1 lg:flex gap-3 lg:gap-5 overflow-x-hidden mt-3`}
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
                                                className={`flex flex-col gap-2 justify-center items-center w-full min-w-[254px] min-h-[254px]`}
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
                                                    disabled={isLoading}
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
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-0.5">
                                                <input
                                                    type="file"
                                                    name="profile-image"
                                                    accept=".jpg, .jpeg, .png"
                                                    onChange={async (e) =>
                                                        await updateShallow('img', e)
                                                    }
                                                    className="absolute bg-transparent rounded h-[250px] w-[250px] text-transparent z-50 hover:cursor-pointer text-center"
                                                    src={formatPeerImg(shallowForm.img)}
                                                />
                                                <span className="absolute h-[254px] w-[254px] -translate-x-0.5 translate-y-0.5">
                                                    <span className="flex justify-center items-center h-full w-full -top-1 relative rounded bg-[rgba(0,0,0,0.6)] text-center text-xs p-4">
                                                        {imgFile ? (
                                                            imgFile
                                                        ) : (
                                                            <>
                                                                Click to
                                                                <br />
                                                                Upload
                                                            </>
                                                        )}
                                                    </span>
                                                </span>
                                                <div className="w-[250px] h-[250px] flex justify-center items-center rounded-sm">
                                                    <img
                                                        src={formatPeerImg(shallowForm.img)}
                                                        alt="account profile picture"
                                                        className="object-cover h-full w-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <Button
                                            className={`text-sm text-center lg:absolute lg:mt-72 ${
                                                useNft.using ? 'mt-5' : ''
                                            }`}
                                            type="transparent"
                                            onClick={toggleUseNft}
                                            disabled={isLoading}
                                        >
                                            Use {useNft.using ? 'File' : 'NFT'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Avatar
                                        size={250}
                                        peer={pintswap?.module?.address}
                                        imgShape="square"
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 lg:gap-2 lg:flex-auto">
                                <div>
                                    <Input
                                        value={
                                            ''
                                            // isEditing
                                            //     ? name
                                            //     : name.includes('.drip')
                                            //     ? name
                                            //     : truncate(name)
                                        }
                                        onChange={async ({ target }) =>
                                            await updateShallow('name', target.value)
                                        }
                                        type="text"
                                        title="Username"
                                        enableStateCss
                                        // disabled={!isEditing || loading}
                                        disabled
                                        placeholder={isEditing ? 'Coming soon!' : 'No username'}
                                        max={50}
                                        // className={`!rounded-r-none`}
                                    />
                                    {/* {isEditing && (
                                            <DropdownInput
                                                state={extension}
                                                type="input-ext"
                                                wrapperClass="!w-fit"
                                                disabled
                                            />
                                        )} */}
                                </div>
                                <div>
                                    <Input
                                        value={shallowForm.bio}
                                        onChange={async ({ target }) =>
                                            await updateShallow('bio', target.value)
                                        }
                                        type="text"
                                        title="Bio"
                                        enableStateCss
                                        disabled={!isEditing || isLoading}
                                        placeholder={isEditing ? 'Start typing here...' : 'No bio'}
                                        max={100}
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={
                                            (!isEditing &&
                                                ((shallowForm.privateKey &&
                                                    shallowForm.privateKey.replace(/\w/g, '*')) ||
                                                    '')) ||
                                            shallowForm.privateKey ||
                                            ''
                                        }
                                        onChange={async ({ target }) =>
                                            await updateShallow('privateKey', target.value)
                                        }
                                        type="password"
                                        title="Private Key"
                                        enableStateCss
                                        disabled={!isEditing || isLoading}
                                        placeholder={
                                            isEditing ? 'Start typing here...' : 'No private key'
                                        }
                                        max={100}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-3 lg:gap-5 mt-3 lg:mt-5">
                            {isError && (
                                <div className="flex justify-start w-full">
                                    <span className="text-red-400">
                                        Error occured while saving data
                                    </span>
                                </div>
                            )}
                            {!isEditing ? (
                                <Button
                                    onClick={() =>
                                        incorrectSigner ? signIfNecessary() : setIsEditing(true)
                                    }
                                    form="reset"
                                    type="outline-secondary"
                                >
                                    {incorrectSigner ? 'Sign to edit' : 'Edit'}
                                </Button>
                            ) : (
                                <>
                                    <Button form="reset" onClick={handleCancel} type="transparent">
                                        Cancel
                                    </Button>
                                    <Button form="submit" onClick={handleSave} loading={isLoading}>
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Tab.Panel>
                <Tab.Panel>
                    <>{console.log('table', tableData)}</>
                    <DataTable
                        columns={activeColumns}
                        data={tableData}
                        type="manage"
                        toolbar={false}
                    />
                </Tab.Panel>
                <Tab.Panel>
                    <DataTable
                        columns={historyColumns}
                        data={subgraph?.data?.userHistory as IUserHistoryItemProps[]}
                        toolbar={false}
                        type="history"
                        loading={subgraph.isLoading}
                    />
                </Tab.Panel>
            </Card>
            <FadeIn show={!incorrectSigner}>
                <div className="flex flex-row gap-3 justify-center items-center">
                    <TooltipWrapper
                        text={
                            userData.active
                                ? 'Removes offers from public orderbook'
                                : 'Posts offers to public orderbook'
                        }
                        id="account-module-publish"
                    >
                        <Button
                            onClick={toggleActive}
                            className="sm:max-w-lg sm:self-center"
                            type="outline"
                        >
                            {userData.active ? 'Stop Publishing' : 'Publish Offers'}
                        </Button>
                    </TooltipWrapper>
                    <Button
                        onClick={() => navigate('/create')}
                        className="sm:max-w-lg sm:self-center"
                    >
                        Create Offer
                    </Button>
                </div>
            </FadeIn>
        </div>
    );
};
