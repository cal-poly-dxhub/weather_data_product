import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import { BrowserRouter, Route } from "react-router-dom"

import SnapshotCard from './SnapshotCard';
import snapshotsJSON from '../snapshots.json'
import LocationChips from './LocationChips';
import InstrumentChips from './InstrumentChips';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function NestedGrid() {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/mini-sodar/snapshot';

    axios.get(baseUrl, {
      params: {},
      headers: {
        'Accept': '*/*',
        'x-api-key': 'k7Zq8E1jzJ7yUFzPWhmwcalkdRRSnIPp5yNMDgdB',
      }
    })
    .then(res => {
      console.log(res.data);
      setSnapshots(res.data);
    })
    .catch(err => {
      console.log(err)
    });

    // setSnapshots(snapshotsJSON)
  }, [])

  return (
    <Grid container className={classes.root} justify='space-between'>
      <Grid container alignItems='center'>
        <Typography variant="p" style={{color: 'gray', fontWeight: 'bold'}}>
          Instruments
        </Typography>
        <InstrumentChips/>
      </Grid>
      <Grid container alignItems='center' style={{marginBottom: 20}}>
        <Typography variant="p" style={{color: 'gray', fontWeight: 'bold'}}>
          Locations
        </Typography>
        <LocationChips locations={snapshots.map(snapshot => snapshot.instrument.asset_name)}/>
      </Grid>
      <Grid container spacing={2}>
        <BrowserRouter>
          {snapshots.map((snapshot) => (
            <Route path='/'>
              <Grid item xs={12} md={6} lg={4} xl={3}>
                <SnapshotCard snapshot={snapshot}/>
              </Grid>
            </Route>
          ))}
        </BrowserRouter>
      </Grid>
    </Grid>
  );
}
