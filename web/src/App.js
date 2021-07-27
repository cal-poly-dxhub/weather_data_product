import React, { Component, useContext, useEffect } from 'react';
import './App.css';

import Navbar from './components/Navbar';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { UserContext, UserProvider } from './contexts/UserProvider';
import SnapshotHub from './components/SnapshotHub';

import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import ReportBuilder from './components/ReportBuilder';

export default function App() {
  return (
    <Router>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <div className="App">
            <nav className="App-header">
              <Navbar/>
            </nav>
            <Switch>
              <Route path="/" component={SnapshotHub}/>
              <Route path="/docs" component={ReportBuilder}/>
            </Switch>
          </div>
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}