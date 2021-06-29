import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify'
import axios from 'axios';
import './App.css';

import Columns from './components/Columns'
import Navbar from './components/Navbar'
import InstrumentChips from './components/InstrumentChips';
import SnapshotGrid from './components/SnapshotGrid'

import { Grid } from '@material-ui/core';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme'

import { UserProvider } from './contexts/UserProvider'

class App extends Component {  
  state = {
    token: {},
    instrument: {},
    tower: {},
    measurements: []
  }

  componentDidMount() {
    const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/prod/mini-sodar';

    // Auth.currentSession()
    // .then(session => {
    //   this.setState({ token: session.getIdToken()["jwtToken"] })
    // })
    // .catch(() => console.log('Not signed in'))
    // .then(() => {
    //   console.log(this.state.token)

    //   axios.get(baseUrl, {
    //     params: {
    //       assetId: 522
    //     },
    //     headers: {
    //       'Accept': '*/*',
    //       'x-api-key': 'k7Zq8E1jzJ7yUFzPWhmwcalkdRRSnIPp5yNMDgdB'
    //     }
    //   })
    //   .then(res => {
    //     console.log("data:", res['data'])
    //     this.setState({ measurements: res['data']['measurements']});
    //     this.setState({ instrument: res['data']['instrument']});
    //     this.setState({ tower: res['data']['tower']});
    //   })
    //   .catch(err => console.log(err));  
    // })
  }

  render() {
    return (
      <UserProvider>
        <ThemeProvider theme={theme}>
          <div className="App">
            <nav className="App-header">
              <Navbar/>
            </nav>
            <body>
              <section>
                <SnapshotGrid/>
              </section>
            </body>
          </div>
        </ThemeProvider>
      </UserProvider>
    );
  }
}

export default App;