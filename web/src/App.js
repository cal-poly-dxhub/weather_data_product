import React, { Component, useContext, useEffect } from 'react';
import './App.css';

import Navbar from './components/Navbar';

import { Container, useMediaQuery } from '@material-ui/core';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { UserContext, UserProvider } from './contexts/UserProvider';
import SnapshotHub from './components/SnapshotHub';
import SnapshotGrid from './components/SnapshotGrid';

import { Route, BrowserRouter as Router, Switch, Redirect, useHistory } from 'react-router-dom';
import ReportBuilder from './components/ReportBuilder';

export default function App() {
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Router>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <div className="App">
            <nav style={{paddingBottom: matchesSm ? "5rem" : matchesMd ? "8rem": 0}}>
              <Navbar/>
            </nav>
            <Container style={{paddingBottom: "3rem"}}>
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
                )}/>
              </Switch>
            </Container>
          </div>
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}