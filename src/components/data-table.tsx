import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiCache, muiOptions, muiTheme } from '../utils/mui';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import { SpinnerLoader } from './spinner-loader';
import { useWindowSize } from '../hooks/window-size';
import { useNavigate } from 'react-router-dom';
import { truncate } from '../utils/common';
import { Dispatch, SetStateAction } from 'react';

type IDataTableProps = {
    title?: string;
    data: (object | number[] | string[])[];
    columns: MUIDataTableColumnDef[];
    loading?: boolean;
    type: 'explore' | 'pairs' | 'peers' | 'orderbook' | 'asks' | 'bids';
    peer?: string;
    toolbar?: boolean;
    pagination?: boolean;
    options?: any;
    getRow?: Dispatch<SetStateAction<any[]>>;
};

export const DataTable = ({
    title,
    data,
    columns,
    loading,
    type,
    peer,
    toolbar = true,
    pagination = true,
    options,
    getRow,
}: IDataTableProps) => {
    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={muiTheme()}>
                <MUIDataTable
                    title={title}
                    data={data}
                    columns={columns}
                    options={{
                        ...muiOptions,
                        ...options,
                        search: toolbar,
                        filter: toolbar,
                        searchAlwaysOpen: toolbar,
                        pagination: pagination,
                        textLabels: {
                            body: {
                                noMatch: loading ? (
                                    <SpinnerLoader className={'justify-start lg:justify-center'} />
                                ) : (
                                    'Error occured while fetching data. Please refresh the page.'
                                ),
                            },
                        },
                        customRowRender: (data, dataIndex, rowIndex) => {
                            Object.defineProperty(data, 'index', {
                                value: dataIndex,
                                enumerable: false,
                                writable: false,
                                configurable: true,
                            });
                            return (
                                <CustomRow
                                    key={`data-table-row-${rowIndex}`}
                                    data={data}
                                    columns={columns.map((col: any) => col.label)}
                                    loading={loading}
                                    type={type}
                                    peer={peer}
                                    getRow={getRow}
                                />
                            );
                        },
                    }}
                />
            </ThemeProvider>
        </CacheProvider>
    );
};

const CustomRow = ({ columns, data, loading, type, peer, getRow }: IDataTableProps) => {
    const cells = Object.values(data as object);
    (cells as any).index = (data as any).index;
    const cols = columns as string[];
    const { width } = useWindowSize();
    const navigate = useNavigate();
    const baseStyle = `text-left transition duration-200 border-y-[1px] border-neutral-800 ${
        loading ? '' : 'hover:bg-gray-900 hover:cursor-pointer'
    }`;

    const route = (cells: string[]) => {
        const firstCell = cells[0];
        let url = '/';
        switch (type) {
            case 'explore': // TODO: fix
                return navigate(`${url}${firstCell}`);
            case 'pairs':
                url = `${url}pairs`;
                break;
            case 'peers':
                url = `${url}peers`;
                break;
            case 'orderbook':
                url = `${url}fulfill`;
                break;
            case 'asks':
            case 'bids':
                if (getRow)
                    getRow(
                        ((v) => {
                            (v as any).index = (data as any).index;
                            return v;
                        })([type, ...cells]),
                    );
                return;
            default:
                break;
        }
        if (peer) navigate(`${url}/${peer}/${firstCell}`);
        else navigate(`${url}/${firstCell}`);
    };

    const formatCell = (s: string) => {
        switch (s) {
            case 'ask':
                return 'Ask';
            case 'bid':
                return 'Bid';
            default:
                return s;
        }
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
    // Desktop
    if (width >= 900) {
        return (
            <tr className={`${baseStyle} ${determineColor()}`} onClick={(e) => route(cells)}>
                {cells.map((cell, i) => (
                    <td
                        key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
                        className={`py-2 pl-4`}
                    >
                        {cell?.startsWith('Q') || cell?.startsWith('0x')
                            ? truncate(cell, 2)
                            : formatCell(cell)}
                    </td>
                ))}
            </tr>
        );
        // Mobile
    } else {
        return (
            <tr
                className={`${baseStyle} flex flex-col px-4 py-1 ${determineColor()}`}
                onClick={(e) => route(cells)}
            >
                {cells.map((cell, i) => (
                    <td
                        key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
                        className={`py-[1px] flex justify-between items-center`}
                    >
                        <span className="text-gray-300 font-thin">{cols[i]}</span>
                        <span>
                            {cell?.startsWith('Q') || cell?.startsWith('0x')
                                ? truncate(cell, 5)
                                : formatCell(cell)}
                        </span>
                    </td>
                ))}
            </tr>
        );
    }
};
