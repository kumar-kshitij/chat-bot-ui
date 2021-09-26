import React from "react";
import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import GoodTimesTtf from "../assets/fonts/good-times.rg-regular.ttf";
import HomePage from "./HomePage";

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
      <HomePage />
    </ThemeProvider>
  );
};

export default App;
