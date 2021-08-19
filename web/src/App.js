import React, { Component, useContext, useEffect } from 'react';
import './App.css';

import Navbar from './components/NavBar/Navbar';

import { Box, Container, useMediaQuery } from '@material-ui/core';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { UserContext, UserProvider } from './contexts/UserProvider';
import SnapshotHub from './components/Snapshots/SnapshotHub';
import SnapshotGrid from './components/Snapshots/SnapshotGrid';

import { Route, BrowserRouter as Router, Switch, Redirect, useHistory } from 'react-router-dom';
import ReportBuilder from './components/ArchiveView/ReportBuilder';

export default function App() {
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Router>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <Box className="App" display="flex" flexDirection="column" style={{height: "100vh"}}>
            <nav style={{paddingBottom: matchesSm ? "5rem" : matchesMd ? "8rem": 0}}>
              <Navbar/>
            </nav>
            <Box flexGrow={1} style={{padding: 20}}>
              <Switch>
                <Route path="/home" component={SnapshotHub}></Route>
                <Route path="/docs" render={(props) => (
                  <div>
                    <h1>Hi docs!</h1>
                  </div>
                )}/>
                <Route path="/">
                  <Redirect to="/home"/>
                </Route>
              </Switch>
            </Box>
          </Box>
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}