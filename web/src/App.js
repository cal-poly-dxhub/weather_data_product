import React, { Component, useContext, useEffect } from 'react';
import './App.css';

import Navbar from './components/Navbar';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { UserContext, UserProvider } from './contexts/UserProvider';
import SnapshotHub from './SnapshotHub';

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <div className="App">
          <nav className="App-header">
            <Navbar/>
          </nav>
          <body>
            <SnapshotHub/>
          </body>
        </div>
      </ThemeProvider>
    </UserProvider>
  );
}