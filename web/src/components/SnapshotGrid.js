import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import PreviewCard from './SnapshotCard';

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
      setSnapshots(res.data);
    })
    .catch(err => console.log(err));
  }, [])

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        {snapshots.map((snapshot) => (
        <Grid item xs>
          <PreviewCard snapshot={snapshot}/>
        </Grid>
        ))}
      </Grid>
    </div>
  );
}
