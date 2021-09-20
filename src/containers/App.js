import React from "react";
import { CssBaseline } from "@mui/material";
import Dictaphone from "../components/Dictaphone";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import GoodTimesTtf from "../assets/fonts/good-times.rg-regular.ttf";

const theme = createTheme({
  typography: {
    fontFamily: "Work Sans, Helvetica, Arial, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Good Times';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('GoodTimesRg'), local('GoodTimesRg-Regular'), url(${GoodTimesTtf}) format('truetype');
        }
      `,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dictaphone />
    </ThemeProvider>
  );
};

export default App;
