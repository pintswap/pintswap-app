import React, { useEffect } from 'react';
import { useState } from 'react';
import { Card, SwitchToggle, Button, SelectCoin, Skeleton, SmartPrice } from '../components';
import { DataTable } from '../tables';
import { IMarketProps } from '../../utils';
import { TbSlash } from 'react-icons/tb';
import { IconContext } from 'react-icons/lib';
import { useUsdPrice } from '../../hooks';

const columns = [
    {
        name: 'quote',
        label: 'Ticker',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'buy',
        label: 'Buy',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'sell',
        label: 'Sell',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'market',
        label: 'Market',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

interface TokenInfo {
    amount: string;
    token: string;
}

interface Offer {
    gets: TokenInfo;
    gives: TokenInfo;
}

interface MarketDetails {
    best: number;
    offers: Offer[];
    sum: number;
}

interface MarketType {
    bases: string[];
    buy: MarketDetails;
    sell: MarketDetails;
    offers: number;
    quote: string;
}

const dummyMarkets = [
    {
        bases: [],
        buy: {
            best: 0.07654321,
            offers: [
                {
                    gets: {
                        amount: '0xe8913890bde6d8',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                    gives: {
                        amount: '0x031dd85d045c50000000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                },
            ],
            sum: 67941.1412256516,
            tax: 1.3,
        },
        offers: 10,
        quote: 'JOE/ETH',
        sell: {
            best: 0.12345,
            offers: [
                {
                    gets: {
                        amount: '0xe7a36dc8aeaab00000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                    gives: {
                        amount: '0x41694e23f4a42c',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                },
            ],
            sum: 113553.44743854503,
            tax: 1.8,
        },
    },
    {
        bases: [],
        buy: {
            best: 0.07654321,
            offers: [
                {
                    gets: {
                        amount: '0xe8913890bde6d8',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                    gives: {
                        amount: '0x031dd85d045c50000000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                },
            ],
            sum: 67941.1412256516,
            tax: 0.002,
        },
        offers: 10,
        quote: 'AXE/ETH',
        sell: {
            best: 0.12345,
            offers: [
                {
                    gets: {
                        amount: '0xe7a36dc8aeaab00000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                    gives: {
                        amount: '0x41694e23f4a42c',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                },
            ],
            sum: 113553.44743854503,
            tax: 0.0004,
        },
    },
    {
        bases: [],
        buy: {
            best: 0.07654321,
            offers: [
                {
                    gets: {
                        amount: '0xe8913890bde6d8',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                    gives: {
                        amount: '0x031dd85d045c50000000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                },
            ],
            sum: 67941.1412256516,
            tax: 0.0003,
        },
        offers: 10,
        quote: 'HOUSE/ETH',
        sell: {
            best: 0.12345,
            offers: [
                {
                    gets: {
                        amount: '0xe7a36dc8aeaab00000',
                        token: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
                    },
                    gives: {
                        amount: '0x41694e23f4a42c',
                        token: '0x0000000000000000000000000000000000000000',
                    },
                },
            ],
            sum: 113553.44743854503,
            tax: 0.07,
        },
    },
];

export default function MarketMakerView() {
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [quoteAsset, setQuoteAsset] = useState('');
    const [baseAsset, setBaseAsset] = useState('');
    const list: any = [];
    const [market, setMarket] = useState<MarketType | null>(null);
    const [userMarkets, setUsermarkets] = useState<MarketType[]>(dummyMarkets);

    //captures market you want to make
    const makeMarket = () => {
        console.log('make market button');
        const newMarket: MarketType = {
            bases: [],
            buy: {
                best: 0,
                offers: [],
                sum: 0,
            },
            offers: 0,
            quote: `${quoteAsset}/${baseAsset}`,
            sell: {
                best: 0,
                offers: [],
                sum: 0,
            },
        };
        setMarket(newMarket);
        setUsermarkets((userMarkets) => [...userMarkets, newMarket]);
    };

    const hideText = () => {
        console.log(window.innerWidth);
        if (window.innerWidth <= 400) {
            return true;
        }
    };

    function renderInputUsd(asset: string | undefined) {
        const usdPrice = useUsdPrice(asset);
        return asset ? Number(1) * Number(usdPrice || '0') : 0.0;
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col max-w-lg mx-auto mb-4">
                <h2 className="view-header text-left">Market Maker</h2>
                <Card className="!p-4 text-center">
                    <div className="flex justify-center shadow-inner items-center">
                        <div className=" px-6 pr-14 grid grid-cols-1 text-center mt-2 bg-neutral-900 rounded-lg h-40 basis-1/2 sm:w-60 grow-0">
                            <div className="basis-1/3 flex flex-row items-center justify-center w-full">
                                <h3 className="text-gray-400">Quote</h3>
                                <h3 className="hidden sm:block ml-[5px] text-gray-400"> Token </h3>
                            </div>
                            <div className="basis-1/3 flex items-center justify-center">
                                <SelectCoin
                                    asset={quoteAsset}
                                    onAssetClick={(e: any) => {
                                        setQuoteAsset(e.target.innerText);
                                        setOpen1(false);
                                    }}
                                    // hide={hideText()}
                                    modalOpen={open1}
                                    setModalOpen={setOpen1}
                                ></SelectCoin>
                            </div>
                            <div className="basis-1/3 flex justify-center">
                                <small className="text-gray-400 flex items-center gap-0.5">
                                    <span>$</span>
                                    <Skeleton
                                        loading={!baseAsset && Number(1) !== 0}
                                        innerClass="!px-1"
                                    >
                                        <span className="flex items-center gap-1">
                                            <SmartPrice price={renderInputUsd(quoteAsset)} />
                                        </span>
                                    </Skeleton>
                                </small>
                            </div>
                        </div>
                        <div className="bg-brand-dashboard rounded-lg flex w-7 h-40 justify-center items-center relative ">
                            <div className=" absolute bg-brand-dashboard rounded-lg">
                                <TbSlash color={'white'} size={'4rem'} />
                            </div>
                        </div>
                        <div className=" px-6 pl-14 grid grid-cols-1 text-center mt-2  bg-neutral-900 rounded-lg h-40 basis-1/2 sm:w-80">
                            <div className="basis-1/3 flex flex-row items-center justify-center">
                                <h3 className="text-gray-400">Base</h3>
                                <h3 className="hidden sm:block ml-[5px] text-gray-400"> Token </h3>
                            </div>
                            <div className="basis-1/3 flex justify-center items-center">
                                <SelectCoin
                                    asset={baseAsset}
                                    onAssetClick={(e: any) => {
                                        setBaseAsset(e.target.innerText);
                                        setOpen2(false);
                                    }}
                                    // hide={hideText()}
                                    modalOpen={open2}
                                    setModalOpen={setOpen2}
                                ></SelectCoin>
                            </div>
                            <div className="basis-1/3 flex justify-center">
                                <small className="text-gray-400 flex items-center gap-0.5">
                                    <span>$</span>
                                    <Skeleton
                                        loading={!baseAsset && Number(1) !== 0}
                                        innerClass="!px-1"
                                    >
                                        <span className="flex items-center gap-1">
                                            <SmartPrice price={renderInputUsd(baseAsset)} />
                                        </span>
                                    </Skeleton>
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            loading={false}
                            onClick={makeMarket}
                            className="!py-2.5 w-52 self-center mt-4 mb-1"
                        >
                            Create Market
                        </Button>
                    </div>
                </Card>
            </div>
            <div>
                <h2 className="view-header text-left">Your Markets</h2>
                <Card>
                    <DataTable
                        type="markets"
                        columns={columns}
                        data={userMarkets as IMarketProps[]}
                        loading={false}
                        pagination
                        options={{
                            sortOrder: {
                                name: 'quote',
                                direction: 'asc',
                            },
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}
