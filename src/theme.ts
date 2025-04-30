import { createTheme } from '@mui/material/styles';

// Match theme colors to the school logo (gold and red)
const theme = createTheme({
  palette: {
    background: {
      default: '#E8F5E9', // Light Sage background
    },
    primary: {
      main: '#9ACD32', // chartreuse green for navbar, sliders, dividers
    },
    secondary: {
      main: '#D32F2F', // red
    },
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#9ACD32', // chartreuse green
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#9ACD32', // chartreuse green
        },
      },
    },
  },
});

export default theme; 