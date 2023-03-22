type ITableProps = {
    items: any[];
};

export const Table = ({ items }: ITableProps) => {
    return (
        <table className="table-fixed">
            <thead>
                <tr className="border-b-2 border-neutral-800">
                    {Object.keys(items[0]).map((el: any, i) => (
                        <th
                            key={`table-header-${el}-${i}`}
                            className={`px-2 pb-1 ${
                                isNaN(items[i][el]) ? 'text-left' : 'text-right'
                            }`}
                        >
                            {el}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {items.map((el, i) => (
                    <tr
                        key={`table-row-${i}`}
                        className={`border-b border-neutral-800 last-of-type:border-0`}
                    >
                        {Object.values(el).map((el: any, i) => (
                            <td
                                key={`table-cell-${i}`}
                                className={`p-2 ${isNaN(el) ? 'text-left' : 'text-right'}`}
                            >
                                {el}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
