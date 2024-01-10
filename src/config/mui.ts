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
            fontFamily: ['Chakra Petch'].join(','),
        },
        palette: {
            mode: 'dark',
            background: {
                // paper: '#0a0a0a',
                paper: 'transparent',
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
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        paddingTop: '6px',
                        paddingBottom: '6px',
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
