import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import Amplify, { Auth, Hub } from 'aws-amplify'
import awsconfig from '../auth/awsconfig.json'
import awsauth from '../auth/awsauth.json'

class Authenticator extends Component {
  componentDidMount () {
    Amplify.configure({
      region: 'us-gov-west-1',
      userPoolId: 'us-gov-west-1_KJAsjiPIx',
      userPoolWebClientId: '70voaaj0mr2h67dvfkm2fmcrd7',
      mandatorySignIn: false,
      cookieStorage: {
        "domain": "localhost",
        "path": "/",
        "expires": 365,
        "secure": true
      },
      oauth: {
        domain: 'dev.auth-fips.us-gov-west-1.amazoncognito.com',
        scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: 'http://localhost:3000/',
        redirectSignOut: 'http://localhost:3000/',
        responseType: 'token'
      }
    })
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          console.log('sign in', event, data)
          // this.setState({ user: data})
          break
        case 'signOut':
          console.log('sign out')
          // this.setState({ user: null })
          break
      }
    })
  }

  render() {
    return (
      <Grid container spacing={0} justify='flex-start'>
        <Grid item xs={6}>
          <button onClick={() => Auth.federatedSignIn()}>
            Sign In
          </button>
        </Grid>
        <Grid item xs={6}>
          <button onClick={() => Auth.signOut()}>
            Sign Out
          </button>
        </Grid>
      </Grid>
    );
  }
}

export default Authenticator;