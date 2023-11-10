import React, { useEffect } from 'react';
import { useState } from 'react';
import { useTrade } from '../../hooks';
import { Card, SwitchToggle, Button, Header } from '../components';
import { CoinInput } from '../features';
import { DataTable } from '../tables';
import { IMarketProps } from '../../utils';

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
    const [isBuying, setIsBuying] = useState(true);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteAsset, setQuoteAsset] = useState('');
    const [baseAmount, setBaseAmount] = useState('');
    const [baseAsset, setBaseAsset] = useState('');
    const list: any = [];
    const [userMarkets, setUserMarkets] = useState([]);

    useEffect(() => {
        console.log('quote amount:', quoteAmount);
        console.log('asset:', quoteAsset);
        console.log(isBuying);
    });
    const makeMarket = () => {
        return 1;
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col max-w-lg mx-auto mb-4">
                <h2 className="view-header text-left">Market Maker</h2>
                <Card className="!py-4" type="tabs" tabs={[]}>
                    <SwitchToggle
                        labelOn="Buy"
                        labelOnTooltip=""
                        labelOff="Sell"
                        labelOffTooltip=""
                        state={!isBuying}
                        setState={() => setIsBuying(!isBuying)}
                        customColors={[
                            'bg-gradient-to-tr to-accent-dark from-accent-light',
                            'bg-gradient-to-tr to-green-700 from-emerald-400',
                        ]}
                    />
                    <CoinInput
                        label="Quote token"
                        asset={quoteAsset}
                        onAssetClick={(e: any) => setQuoteAsset(e.target.innerText)}
                        value={quoteAmount}
                        onAmountChange={({ currentTarget }) => setQuoteAmount(currentTarget.value)}
                    ></CoinInput>
                    <CoinInput
                        label="Base Token"
                        asset={baseAsset}
                        onAssetClick={(e: any) => setBaseAsset(e.target.innerText)}
                        value={baseAmount}
                        onAmountChange={({ currentTarget }) => setBaseAmount(currentTarget.value)}
                    ></CoinInput>
                    <Button className="w-full !py-2.5"> Make</Button>
                </Card>
            </div>
            <div>
                <h2 className="view-header text-left">Your Markets</h2>
                <Card type="tabs">
                    <DataTable
                        type="markets"
                        columns={columns}
                        data={dummyMarkets as IMarketProps[]}
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
