import { createMuiTheme } from '@material-ui/core/styles';
import { Rowing } from '@material-ui/icons';

const theme = createMuiTheme({
  typography: {
    allVariants: {
      color: "#ffffff",
      textTransform: "none",
    },
    subtitle2: {
      color: "#919191",
      fontWeight: "bold",
    }
  },
  buttons: {
    textTransform: "none",
  },
  palette: {
    primary: {
      main: '#D174FE',
      dark: '#D174FE'
    },
    secondary: {
      main: '#472A54',
      dark: '#472A54'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff'
    },
    outlined: {
      primary: '#ffffff'
    }
  },
  overrides: {
    MuiCardContent: {
      root: {
        backgroundColor: '#242026',
      },
    },
    MuiCard: {
      root: {
        borderColor: '#464646'
      }
    },
    MuiTableCell: {
      head: {
        borderColor: '#464646',
      },
      body: {
        borderColor: '#464646',
      }
    },
    MuiChip: {
      root: {
        color: '#ffffff',
        borderColor: '#ffffff'
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: "#242026",
      }
    },
    MuiDataGrid: {
      root: {
        backgroundColor: "#242026",
        borderWidth: 0
      },
      columnHeader: {
        backgroundColor: "#242026",
        borderWidth: 0
      },
    },
  }
});

theme.props = {
  MuiButton: {
    disableElevation: true,
    variant: 'contained'
  },
  MuiTypography: {
    // noWrap: true,
  },
  MuiIconButton: {
    // color: 'primary'
  },
  MuiDivider: {
  }
}

export default theme;