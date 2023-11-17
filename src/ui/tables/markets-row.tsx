/**
 * @todo complete development
 */
import { useNavigate } from 'react-router-dom';
import { useUsdPrice, useWindowSize } from '../../hooks';
import { IDataTableProps } from './data-table';
import { Asset, SmartPrice } from '../components';
import { IMarketProps, numberFormatter } from '../../utils';

export const MarketsRow = (props: IDataTableProps) => {
    const { columns, data, loading, type, peer, getRow, activeRow, column } = props;
    const cells = Object.values(data as object);
    (cells as any).index = (data as any).index;

    const cols = columns as string[];
    const { tableBreak } = useWindowSize();
    const navigate = useNavigate();
    const usdPrice = '';
    // useUsdPrice((data[0] as any).split('/')[0]);

    const baseStyle = `text-left transition duration-150 border-y-[1px] first:border-transparent border-neutral-800 first:border-transparent sm:first:border-neutral-800 ${
        loading ? '' : 'hover:bg-neutral-900 hover:cursor-pointer'
    } ${activeRow === `${type}-${(cells as any).index}` ? '!bg-neutral-800' : ''}`;

    const route = async (cells: string[]) => {
        return navigate(`/markets/${cells[0].replaceAll('/', '-').toLowerCase()}`);
    };

    const determineColor = () => {
        switch (type) {
            case 'asks':
                return `text-red-400`;
            case 'bids':
                return `text-green-400`;
            default:
                return `text-neutral-100`;
        }
    };

    const determineCell = (cell: string | IMarketProps, index: number) => {
        console.log('cell', cell);
        if (!cell) {
            return (
                <p className="flex items-center justify-end sm:justify-start gap-0.5">
                    <span className="text-xs">$</span>
                    {usdPrice ? (
                        <span className="sm:text-lg">
                            <SmartPrice price={usdPrice} />
                        </span>
                    ) : (
                        '-'
                    )}
                </p>
            );
        } else {
            if (typeof cell !== 'string') {
                const _cell = cell as any;
                return (
                    <span className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
                        <span className="sm:text-lg flex items-center gap-0.5">
                            <span className="text-xs">$</span>
                            <SmartPrice price={_cell.best} />
                        </span>
                        <span className="flex-col hidden sm:flex">
                            <span className="text-xs">
                                <span className="text-neutral-400">Liquid:</span>{' '}
                                {Number(_cell.sum) < 100 ? (
                                    <SmartPrice price={_cell.sum} />
                                ) : (
                                    numberFormatter().format(_cell.sum)
                                )}
                            </span>
                            <span className="text-xs">
                                <span className="text-neutral-400">Offers:</span> {_cell.offers}
                            </span>
                        </span>
                    </span>
                );
            } else if (cell.includes('.')) {
                return (
                    <span className="flex items-center gap-1">
                        <small>$</small>
                        <SmartPrice price={cell} />
                    </span>
                );
            } else if (cell.includes('/')) {
                return (
                    <span className="flex items-center gap-1">
                        <Asset symbol={cell.split('/')[0]} size={20} />
                        <span>/</span>
                        <Asset symbol={cell.split('/')[1]} size={20} />
                    </span>
                );
            } else {
                return <span>{cell}</span>;
            }
        }
    };

    // Desktop
    if (tableBreak) {
        return (
            <tr
                className={`text-sm xl:text-base ${baseStyle} ${determineColor()}`}
                onClick={(e) => route(cells)}
            >
                {cells.map((cell, i) => (
                    <td
                        key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
                        className={`py-2 px-4`}
                    >
                        {determineCell(cell, i)}
                    </td>
                ))}
            </tr>
        );
        // Mobile
    } else {
        return (
            <tr
                className={`${baseStyle} grid grid-cols-1 px-4 py-1 ${determineColor()}`}
                onClick={(e) => route(cells)}
            >
                {cells.map((cell, i) => (
                    <td
                        key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
                        className={`py-[1px] flex justify-between items-center`}
                    >
                        <span className="text-gray-300 font-thin text-sm">{cols[i]}</span>
                        <span className={`${!cell ? 'w-full' : ''}`}>{determineCell(cell, i)}</span>
                    </td>
                ))}
            </tr>
        );
    }
};
