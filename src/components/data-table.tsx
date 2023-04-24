import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiCache, muiOptions, muiTheme } from '../utils/mui';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import { SpinnerLoader } from './spinner-loader';
import { useWindowSize } from '../hooks/window-size';
import { useNavigate } from 'react-router-dom';
import { truncate } from '../utils/common';

type IDataTableProps = {
  title?: string;
  data: (object | number[] | string[])[];
  columns: MUIDataTableColumnDef[];
  loading?: boolean;
  type: 'explore' | 'pairs' | 'peers' | 'orderbook';
  peer?: string;
}

export const DataTable = ({ title, data, columns, loading, type, peer }: IDataTableProps) => {
  const { width } = useWindowSize();
  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={muiTheme()}>
        <MUIDataTable
          title={title}
          data={data}
          columns={columns}
          options={{
            ...muiOptions,
            textLabels: {
              body: {
                  noMatch: 
                  loading ? (
                      <SpinnerLoader className={"justify-start lg:justify-center"} />
                  ) : (
                      'Error occured while fetching data. Please refresh the page.'
                  ),
              },
            },
            customRowRender: (data, dataIndex, rowIndex) => (
              <CustomRow 
                key={`data-table-row-${rowIndex}`} 
                data={data} 
                columns={columns.map((col: any) => col.label)} 
                loading={loading}
                type={type}
                peer={peer}
              />
            )
          }}
        />
      </ThemeProvider>
    </CacheProvider>
  )
}

const ln = (v: any, label: string) => ((console.log(label, v)), v);

const CustomRow = ({ columns, data, loading, type, peer }: IDataTableProps) => {
  const cells = Object.values((data as object));
  const cols = columns as string[];
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const baseStyle = `text-left transition duration-200 border-y-[1px] border-neutral-800 ${loading ? '' : 'hover:bg-gray-900 hover:cursor-pointer'}`

  const route = (firstCol: string) => {
    let url = '/';
    switch(type) {
      case 'explore': // TODO: fix
        return navigate(ln(`${url}${cells[0]}`, 'URL'));
      case 'pairs':
        url = `${url}pairs`;
        break;
      case 'peers':
        url = `${url}peers`;
        break;
      case 'orderbook':
        url = `${url}fulfill`;
        break;
      default:
        break;
    }
    if(peer) navigate(`${url}/${peer}/${firstCol}`)
    else navigate(`${url}/${firstCol}`)
  }

  const formatCell = (s: string) => {
    switch(s) {
      case 'ask' : return 'Ask';
      case 'bid': return 'Bid';
      default: return s;
    }
  }
    // Desktop
    if (width >= 900) {
      return (
        <tr
          className={baseStyle}
          onClick={(e) => route(cells[0])}
        >
          {cells.map((cell, i) => (
            <td 
              key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
              className="py-2 pl-4"
            >
              {cell?.startsWith('Q') || cell?.startsWith('0x') ? truncate(cell, 2) : formatCell(cell)}
            </td>
          ))}
        </tr>
      );
    // Mobile
    } else {
      return (
        <tr
          className={`${baseStyle} flex flex-col px-4 py-1`}
          onClick={(e) => route(cells[0])}
        >
          {cells.map((cell, i) => (
            <td 
              key={`data-table-cell-${i}-${Math.floor(Math.random() * 1000)}`}
              className="py-[1px] flex justify-between items-center"
            >
              <span className="text-gray-300 font-thin">{cols[i]}</span>
              <span>{cell?.startsWith('Q') || cell?.startsWith('0x') ? truncate(cell, 5) : formatCell(cell)}</span>
            </td>
          ))}
        </tr>
      );
    }
}
