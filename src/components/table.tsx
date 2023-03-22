import { MouseEventHandler, ReactNode } from 'react';

type ITableProps = {
    items: any[];
    onClick?: MouseEventHandler<HTMLTableRowElement>;
    emptyContent?: string | ReactNode;
    headers: string[];
};

export const Table = ({ items, onClick, emptyContent, headers }: ITableProps) => {
    if (items.length > 0) {
        return (
            <table className="table-fixed w-full">
                <thead>
                    <tr className="border-b-2 border-neutral-800">
                        {headers.map((el: any, i) => (
                            <th key={`table-header-${el}-${i}`} className={`px-2 pb-1 text-left`}>
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
                            {Object.values(el).map((el: any, i) => (
                                <td key={`table-cell-${i}`} className={`p-2 text-left text-sm`}>
                                    {el}
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
