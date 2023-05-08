import React from 'react';
import { Buffer } from 'buffer';
import { usePintswapContext } from '../stores';

export function BroadcastView() {
    const { pintswap } = usePintswapContext();
    return (
        <>
            <div>
                {pintswap.module && // should display all orders the user currently has
                    //TODO
                    Array.from(pintswap.module.offers.values()).map((i) => {
                        return <div key="s">data</div>;
                    })}
                <button className="bg-white px-[10px] rounded-full font-titillium text-black tracking-widest uppercase text-[25px]">
                    Initiate Broadcast
                </button>
            </div>
        </>
    );
}
