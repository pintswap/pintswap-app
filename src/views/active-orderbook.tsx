import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Card, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';
import { shorten } from '../utils/shorten';
import { memoize } from 'lodash';

const toFlattened = memoize((v) =>
    [...v.entries()].reduce(
        (r, [multiaddr, [_, offerList]]) =>
            r.concat(
                offerList.map((v: any) => ({
                    ...v,
                    peer: multiaddr,
                })),
            ),
        [],
    ),
);

export const ActiveOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, availableTrades } = useGlobalContext();
    const { error } = useTrade();

    return (
        <div className="flex flex-col gap-6">
            <Card header="Open Trades" scroll>
                {/* TODO */}
                <Table
                    headers={['Peer', 'Sending', 'Receiving']}
                    onClick={(trade: any) => navigate(`/${trade.peerFull}`)}
                    items={toFlattened(availableTrades).map((v: any) => {
                        const offer = { ...v };
                        const peerFull = v.peer;
                        const peer = shorten(peerFull);
                        const ary = [
                            peer,
                            convertAmount('readable', offer.givesAmount, offer.givesToken),
                            convertAmount('readable', offer.getsAmount, offer.getsToken),
                        ] as any;
                        Object.defineProperty(ary, 'peerFull', {
                            value: peerFull,
                            writable: true,
                            configurable: true,
                            enumerable: false,
                        });
                        return ary;
                    })}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? (
                                    <span>
                                        Error loading available offers.{' '}
                                        <button
                                            onClick={() => navigate(0)}
                                            className="text-indigo-600 transition duration-200 hover:text-indigo-700"
                                        >
                                            Try refreshing.
                                        </button>
                                    </span>
                                ) : availableTrades.size === 0 ? (
                                    'No active offers'
                                ) : (
                                    'Loading available offers...'
                                )}
                            </span>
                        )
                    }
                />
            </Card>
        </div>
    );
};
