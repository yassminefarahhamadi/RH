// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // red
    },
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#212121',
    },
  },
});

export default theme;
