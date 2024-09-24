import React from "react";
import ReactDOM from "react-dom";
import App from './App';
import { ContextProvider } from "./SocketContext";
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider
import './styles.css';

const theme = createTheme(); // Create a default theme

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <ContextProvider>
    <App />
    </ContextProvider>,
  </ThemeProvider>,
  document.getElementById('root')
);
