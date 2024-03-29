import { convertExponentialToDecimal } from '../../utils';

export function SmartPrice({
    price,
    type = 'default',
}: {
    price: string | number;
    type?: 'usd' | 'default';
    align?: 'right' | 'left';
}) {
    const _price = String(price);
    if (_price === 'N/A' && !_price) return <>-</>;

    // The case where the price is not too small
    let mustReduce = _price.substring(0, 6) === '0.0000';
    if (!mustReduce) {
        if (_price.includes('.')) {
            if (Number(price) > 1000000) return <>{_price.split('.')[0]}</>;
            else if (Number(_price) > 100) return <>{Number(_price).toFixed(2)}</>;
        }
        const substringAmount = _price.substring(0, 8);
        if (_price.includes('e-7')) return (parseFloat(substringAmount) * 1000).toFixed(2);
        if (_price.includes('e-8')) return (parseFloat(substringAmount) * 100).toFixed(2);
        if (_price.includes('e-9')) return (parseFloat(substringAmount) * 10).toFixed(2);
        return <>{substringAmount}</>;
    }

    // The case where the price needs to be reduced
    let zeroCount = 0;
    let i = 0;
    let endingFour = '';

    for (let mStr = _price.substring(3); i < mStr.length; i++) {
        if (mStr[i] === '0') {
            zeroCount++;
        } else {
            endingFour = mStr.substring(i, i + 4);
            break;
        }
    }

    return (
        <span className="">
            0.0<sub>{zeroCount}</sub>
            {endingFour}
        </span>
    );
}
