import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiCache, muiOptions, muiTheme } from '../utils/mui';
import MUIDataTable, { MUIDataTableColumnDef } from 'mui-datatables';
import { SpinnerLoader } from './spinner-loader';

type IDataTableProps = {
  title: string;
  data: (object | number[] | string[])[];
  columns: MUIDataTableColumnDef[];
  loading?: boolean;
}

export const DataTable = ({ title, data, columns, loading }: IDataTableProps) => {
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
                  noMatch: loading ? (
                      <SpinnerLoader />
                  ) : (
                      'Error occured while fetching data. Please refresh the page.'
                  ),
              },
            },
          }}
        />
      </ThemeProvider>
    </CacheProvider>
  )
}

// TODO: create custom rows
// TODO: create custom search css