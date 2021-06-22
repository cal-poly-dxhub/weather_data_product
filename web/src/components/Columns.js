import React, { Component, useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';

import LeftColumn from './LeftColumn'
import SodarTable from '../sodar/SodarTable'
import TowerTable from '../tower/TowerTable';
import { UserContext } from "../contexts/UserProvider"

function Columns(props) {
  const [ state, dispatch ] = React.useContext(UserContext)

  useEffect(() => {
    console.log('wowie', props)
  }, [])

  switch (state.instruments.index) {
    case 0:
      return (
        <Grid container direction="row" spacing={2} justify='center'>
          <Grid item xs style={{maxWidth: 900}}>
            <LeftColumn type='tower'/>
          </Grid>
          <Grid item s style={{maxWidth: 900}}>
            <TowerTable/>
          </Grid>
        </Grid>
      )
    default:
      return (
        <Grid container direction="row" spacing={2} justify='center'>
          <Grid item xs style={{maxWidth: 900}}>
            <LeftColumn type='mini-sodar'/>
          </Grid>
          <Grid item s style={{maxWidth: 900}}>
            <SodarTable/>
          </Grid>
        </Grid>
      );
  }
}

export default Columns;