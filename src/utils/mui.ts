import createCache from '@emotion/cache';
import { createTheme } from '@mui/material/styles';
import { MUIDataTableOptions } from 'mui-datatables';

export const muiCache = createCache({
    key: 'mui-datatables',
    prepend: true,
});

export function muiTheme() {
    return (createTheme as any)({
        typography: {
            fontFamily: ['Days One'].join(','),
        },
        palette: {
            mode: 'dark',
            background: {
                paper: '#171717',
            },
            primary: {
                main: '#fff',
            },
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: '0.5rem',
                        backgroundImage: 'none',
                        boxShadow: 'none',
                    },
                },
            },
            MUIDataTablePagination: {
                styleOverrides: {
                    tableCellContainer: {
                        border: '0',
                    },
                },
            },
            MUIDataTableToolbar: {
                styleOverrides: {
                    root: {
                        display: 'flex',
                    },
                },
            },
            MUIDataTableSearch: {
                styleOverrides: {
                    clearIcon: {
                        display: 'none',
                    },
                },
            },
        },
    });
}

export const muiOptions: MUIDataTableOptions = {
    download: false,
    print: false,
    viewColumns: false,
    selectableRowsHeader: false,
    selectableRowsHideCheckboxes: true,
    searchPlaceholder: 'Search...',
};
