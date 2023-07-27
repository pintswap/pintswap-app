export function SmartPrice({ price }: { price: string }) {
    if (price === 'N/A' && !price) return <>-</>;

    // The case where the price is not too small
    let mustReduce = price.substring(0, 6) === '0.0000';
    if (!mustReduce) {
        if (price.includes('.')) {
            if (Number(price) > 1000000) return <>{price.split('.')[0]}</>;
            else if (Number(price) > 1000) return <>{Number(price).toFixed(2)}</>;
        }
        return <>{price.substring(0, 8)}</>;
    }

    // The case where the price needs to be reduced
    let zeroCount = 0;
    let i = 0;
    let endingFour = '';

    for (let mStr = price.substring(3); i < mStr.length; i++) {
        if (mStr[i] === '0') {
            zeroCount++;
        } else {
            endingFour = mStr.substring(i, i + 4);
            break;
        }
    }

    return (
        <>
            0.0<sub>{zeroCount}</sub>
            {endingFour}
        </>
    );
}
