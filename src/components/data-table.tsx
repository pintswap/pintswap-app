import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import MUIDataTable, { MUIDataTableColumnDef, TableSearch } from 'mui-datatables';
import { SpinnerLoader } from './spinner-loader';
import { useWindowSize } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction, SyntheticEvent } from 'react';
import { Button } from './button';
import { useOffersContext, usePintswapContext, usePricesContext, useUserContext } from '../stores';
import { SmartPrice } from './smart-price';
import { useParams } from 'react-router-dom';
import { Asset } from './asset';
import {
    BASE_URL,
    NETWORKS,
    truncate,
    muiCache,
    muiOptions,
    muiTheme,
    numberFormatter,
} from '../utils';
import { detectTradeNetwork } from '@pintswap/sdk';
import { toast } from 'react-toastify';
import { TooltipWrapper } from './tooltip';
import { MdOutlineOpenInNew } from 'react-icons/md';

type IDataTableProps = {
    title?: string;
    data: (object | number[] | string[])[];
    columns: MUIDataTableColumnDef[];
    loading?: boolean;
    type:
        | 'explore'
        | 'pairs'
        | 'peers'
        | 'orderbook'
        | 'asks'
        | 'bids'
        | 'manage'
        | 'peer-orderbook'
        | 'history'
        | 'markets';
    peer?: string;
    toolbar?: boolean;
    pagination?: boolean;
    options?: any;
    getRow?: Dispatch<SetStateAction<any[]>>;
    trade?: string;
    activeRow?: string;
    column?: number;
};

export const DataTable = (props: IDataTableProps) => {
    const {
        data,
        columns,
        title,
        loading,
        type,
        peer,
        toolbar,
        pagination,
        options,
        getRow,
        trade,
        activeRow,
    } = props;
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
                        customSearchRender: (
                            searchText: string,
                            handleSearch: (text: string) => void,
                            hideSearch: () => void,
                            options: any,
                        ) => (
                            <TableSearch
                                searchText={searchText}
                                onSearch={handleSearch}
                                onHide={hideSearch}
                                options={{
                                    ...options,
                                    searchProps: {
                                        autoFocus: false,
                                        ...options.searchProps,
                                    },
                                }}
                            />
                        ),
                        pagination: pagination,
                        textLabels: {
                            body: {
                                noMatch: loading ? (
                                    <SpinnerLoader className={'justify-start lg:justify-center'} />
                                ) : (
                                    <div className="py-4">No data available</div>
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
                                    columns={columns.map((col: any) => col.label)}
                                    data={data}
                                    loading={loading}
                                    type={type}
                                    peer={peer}
                                    getRow={getRow}
                                    activeRow={activeRow}
                                    trade={trade}
                                    column={rowIndex}
                                />
                            );
                        },
                    }}
                />
            </ThemeProvider>
        </CacheProvider>
    );
};

const CustomRow = (props: IDataTableProps) => {
    const { columns, data, loading, type, peer, getRow, activeRow, column } = props;
    const cells = Object.values(data as object);
    (cells as any).index = (data as any).index;

    const { userData } = useUserContext();
    const { pair, base: baseAsset } = useParams();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { eth } = usePricesContext();
    const cols = columns as string[];
    const { tableBreak } = useWindowSize();
    const { deleteTrade, userTrades } = useOffersContext();
    const navigate = useNavigate();

    const baseStyle = `text-left transition duration-200 border-y-[1px] first:border-transparent border-neutral-800 first:border-transparent sm:first:border-neutral-800 ${
        loading ? '' : 'hover:bg-neutral-900 hover:cursor-pointer'
    } ${activeRow === `${type}-${(cells as any).index}` ? '!bg-neutral-800' : ''}`;

    const handleDelete = (e: SyntheticEvent, hash: string) => {
        e.stopPropagation();
        deleteTrade(hash);
    };

    const route = async (cells: string[]) => {
        const firstCell = cells[0];
        const secondCell = cells[1];
        let url = '/';
        if (pair) {
            const [trade, base] = pair.split('-').map((v) => v.toUpperCase());
            return navigate(`${url}${cells[0]}/${trade}/${base}`, { state: { ...props } });
        }
        switch (type) {
            case 'markets':
                return navigate(`/markets/${firstCell.replaceAll('/', '-').toLowerCase()}`);
            case 'explore':
                return navigate(`${url}fulfill/${firstCell}/${secondCell}`, {
                    state: { ...props },
                });
            case 'manage': {
                toast.info('Copied offer share link', { autoClose: 2000 });
                const found = userTrades.get(firstCell);
                const offerChainId = 1;
                // const offerChainId = found ? await detectTradeNetwork(found) : 1;
                return navigator.clipboard.writeText(
                    `${BASE_URL}/#/fulfill/${
                        userData.name || module?.address || module?.peerId?.toB58String()
                    }/${firstCell}/${offerChainId}`,
                );
            }
            case 'history':
                return window.open(`${NETWORKS[chainId].explorer}/tx/${firstCell}`, '_blank');
            case 'peer-orderbook':
                return navigate(`/${peer}/${firstCell}`);
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
        if (type === 'history' || type === 'manage') {
            const [amount, asset] = type === 'manage' ? s.split('  ') : s.split(' ');
            return (
                <span className="flex items-center gap-1.5 justify-end">
                    <SmartPrice price={amount} />
                    <Asset symbol={asset} size={18} position="right" />
                </span>
            );
        }
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

    const determineCell = (cell: string, index: number) => {
        if (!cell) {
            if (type === 'manage') {
                return (
                    <Button
                        className="text-red-400 hover:text-red-500 w-full text-right"
                        type="transparent"
                        onClick={(e) => handleDelete(e, cells[0])}
                    >
                        Cancel
                    </Button>
                );
            } else if (type === 'history' && tableBreak) {
                return (
                    <Button className="text-neutral-400 w-full text-right" type="transparent">
                        <span>Explorer</span>
                        <MdOutlineOpenInNew size={14} />
                    </Button>
                );
            } else if (type === 'markets') {
                return <p className="text-right w-full">Coming Soon</p>;
            }
            return <></>;
        }

        const charsShown = tableBreak ? 4 : 5;
        if (((cell as any).best || (cell as any).best === 0) && type === 'markets') {
            const _cell = cell as any;
            return (
                <span className="flex items-center gap-2">
                    <span className="text-lg flex items-center gap-0.5">
                        <span className="text-xs">$</span>
                        <SmartPrice price={_cell.best} />
                    </span>
                    <span className="flex-col hidden sm:flex">
                        <span className="text-xs">
                            <span className="text-neutral-400">Liquid:</span>{' '}
                            {numberFormatter.format(_cell.sum)}
                        </span>
                        <span className="text-xs">
                            <span className="text-neutral-400">Offers:</span> {_cell.offers}
                        </span>
                    </span>
                </span>
            );
        }
        if (
            typeof cell !== 'number' &&
            (cell?.startsWith('Q') || cell?.startsWith('0x') || cell?.startsWith('pint'))
        ) {
            // Address / MultiAddr
            return truncate(cell, charsShown);
        } else if (!isNaN(Number(cell))) {
            if (type === 'markets' && String(cell).includes('.')) {
                return (
                    <span className="flex items-center gap-1">
                        <small>$</small>
                        <SmartPrice price={cell} />
                    </span>
                );
            }
            // TODO: optimize and enable for all pairs, not just eth and stables
            let _cell: string;
            if (pair) {
                const [quote, base] = pair.split('-');
                if (
                    index === 2 &&
                    (base.includes('eth') || base === 'usdc' || base === 'usdt' || base === 'dai')
                ) {
                    // Display USD value if possible
                    if (base.includes('eth')) _cell = (Number(cell) * Number(eth)).toString();
                    else _cell = cell;
                    return (
                        <span className="flex items-center gap-1">
                            <small>$</small>
                            <SmartPrice price={_cell} />
                        </span>
                    );
                }
                _cell = cell;
                return <SmartPrice price={_cell} />;
            } else {
                // Display USD value if possible
                const _baseAsset = (
                    type === 'peer-orderbook' && cells[0].includes('/')
                        ? cells[0].split('/')[1]
                        : baseAsset
                )?.toLowerCase();
                if (
                    (_baseAsset?.includes('eth') ||
                        _baseAsset === 'usdc' ||
                        _baseAsset === 'usdt' ||
                        _baseAsset === 'dai') &&
                    (index === 0 || type === 'peer-orderbook')
                ) {
                    // Display USD value if possible
                    if (_baseAsset.includes('eth')) _cell = (Number(cell) * Number(eth)).toString();
                    else _cell = cell;
                    return (
                        <span className="flex items-center gap-1">
                            <small>$</small>
                            <SmartPrice price={_cell} />
                        </span>
                    );
                }
                if ((type === 'history' || type === 'manage') && !isNaN(Number(cell)))
                    return (
                        <TooltipWrapper
                            position={tableBreak ? 'right' : 'left'}
                            wrapperClass="w-fit block"
                            text={NETWORKS[Number(cell)].name}
                            id={`account-datatable-${type}-${index}-${NETWORKS[Number(cell)].name}`}
                        >
                            <img src={NETWORKS[Number(cell)].logo} height="18" width="18" />
                        </TooltipWrapper>
                    );
                // Display Big Number
                _cell = cell;
                return <SmartPrice price={_cell} />;
            }
        } else if ((type === 'peer-orderbook' || type === 'markets') && cell.includes('/')) {
            return (
                <span className="flex items-center gap-1">
                    <Asset symbol={cell.split('/')[0]} size={20} />
                    <span>/</span>
                    <Asset symbol={cell.split('/')[1]} size={20} />
                </span>
            );
        } else {
            // Default
            return formatCell(cell);
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
                className={`${baseStyle} flex flex-col px-4 py-1 ${determineColor()}`}
                onClick={(e) => route(cells)}
            >
                {cells.map((cell, i) => (
                    <td
                        key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
                        className={`py-[1px] flex justify-between items-center text-sm`}
                    >
                        <span className="text-gray-300 font-thin">{cols[i]}</span>
                        <span className={`${!cell ? 'w-full' : ''}`}>{determineCell(cell, i)}</span>
                    </td>
                ))}
            </tr>
        );
    }
};
