import { MouseEventHandler, ReactNode } from 'react';
import { useWindowSize } from '../hooks/window-size';
import { truncate } from '../utils/common';

type ITableProps = {
    items: any[];
    onClick?: MouseEventHandler<HTMLTableRowElement>;
    emptyContent?: string | ReactNode;
    headers: string[];
};

export const Table = ({ items, onClick, emptyContent, headers }: ITableProps) => {
    const { width, breakpoints } = useWindowSize();
    if (items.length > 0) {
        return (
            <table className="table-fixed w-full font-gothic">
                <thead>
                    <tr className="border-b-2 border-neutral-800">
                        {headers.map((el: any, i) => (
                            <th key={`table-header-${el}-${i}`} className={`px-2 pb-1 ${i === 0 ? 'text-left' : 'text-right'} text-gray-400 text-lg`}>
                                {el}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((el, i) => (
                        <tr
                            key={`table-row-${i}`}
                            className={`border-b border-neutral-800 last-of-type:border-0 transition duration-150 ${
                                onClick ? 'cursor-pointer hover:backdrop-brightness-110' : ''
                            }`}
                            onClick={() => (onClick ? onClick(el) : {})}
                        >
                            {Object.values(el).map((el: any, i: any) => (
                                <td key={`table-cell-${i}`} className={`p-2 ${i === 0 ? 'text-left' : 'text-right'} text-xl`}>
                                    {String(el).includes('0x') ? truncate(el, width > breakpoints.md ? 5 : 3) : el}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    } else {
        return (
            <div className="flex justify-center gap-1 py-2 text-sm text-neutral-300 text-center">
                {emptyContent ? emptyContent : <p>{'No Data Available'}</p>}
            </div>
        );
    }
};
