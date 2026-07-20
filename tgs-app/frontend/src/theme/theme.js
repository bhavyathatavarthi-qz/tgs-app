import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0B3D91', dark: '#082A66', light: '#3D6FC4', contrastText: '#FFFFFF' },
    secondary: { main: '#0F766E', contrastText: '#FFFFFF' },
    success: { main: '#1E8E5A', light: '#E5F5EC' },
    warning: { main: '#B7791F', light: '#FDF3E2' },
    error: { main: '#B3261E', light: '#FBE9E7' },
    info: { main: '#1E5FA8', light: '#E8F0FB' },
    background: { default: '#F3F5F9', paper: '#FFFFFF' },
    text: { primary: '#151A24', secondary: '#525C6B' },
    divider: '#E2E6ED',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700, letterSpacing: 0.2 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: 0.3 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.2 },
    overline: { fontWeight: 700, letterSpacing: 1.2 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E6ED',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingTop: 10, paddingBottom: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 0 rgba(16,24,40,0.08)' },
      },
    },
  },
});

export default theme;
