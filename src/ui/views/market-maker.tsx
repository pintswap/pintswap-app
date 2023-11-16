import React, { useEffect } from 'react';
import { useState } from 'react';
import { Card, SwitchToggle, Button, Header, SelectCoin } from '../components';
import { DataTable } from '../tables';
import { IMarketProps } from '../../utils';
import { TbSlash } from 'react-icons/tb';
import { IconContext } from 'react-icons/lib';

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

    return (
        <div className="flex-col">
            <div className="flex flex-col max-w-lg mx-auto mb-4">
                <h2 className="view-header text-left">Market Maker</h2>
                <Card className="!p-4 text-center">
                    <div className="flex justify-center shadow-inner items-center">
                        <div className="p-4 pr-16 max-[400]:bg-green flex flex-col justify-center text-center mt-2  bg-neutral-900 rounded-lg h-40 ">
                            <h3 className="basis-1/3 ">Quote Token</h3>
                            <div className="basis-1/3  flex flex-col justify-center">
                                <SelectCoin
                                    asset={quoteAsset}
                                    onAssetClick={(e: any) => {
                                        setQuoteAsset(e.target.innerText);
                                        setOpen1(false);
                                    }}
                                    modalOpen={open1}
                                    setModalOpen={setOpen1}
                                ></SelectCoin>
                            </div>

                            <div className="basis-1/3 "></div>
                        </div>
                        <div className="bg-brand-dashboard rounded-lg flex w-7 h-40 justify-center items-center">
                            <div className=" absolute bg-brand-dashboard rounded-lg">
                                <TbSlash color={'white'} size={'6rem'} />
                            </div>
                        </div>
                        <div className="p-4 pl-16 flex flex-col justify-center text-center mt-2  bg-neutral-900 rounded-lg h-40">
                            <h3 className="basis-1/3">Base Token</h3>
                            <div className="basis-1/3 flex flex-col justify-center">
                                <SelectCoin
                                    asset={baseAsset}
                                    onAssetClick={(e: any) => {
                                        setBaseAsset(e.target.innerText);
                                        setOpen2(false);
                                    }}
                                    modalOpen={open2}
                                    setModalOpen={setOpen2}
                                ></SelectCoin>
                            </div>
                            <div className="basis-1/3"></div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            loading={false}
                            onClick={makeMarket}
                            className="!py-2.5 w-52 self-center m-4"
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
