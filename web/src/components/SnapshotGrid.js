import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { BrowserRouter, Route } from "react-router-dom"

import SnapshotCard from './SnapshotCard';
import snapshotsJSON from '../snapshots.json'
import { UserContext } from '../contexts/UserProvider';

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

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [leftSnapshot, setLeftSnapshot] = useState({});
  const [isTwoColumn, changeToTwoColumn] = useState(false);
  const [state, dispatch] = useContext(UserContext);

  useEffect(() => {
    const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' + props.path + 'snapshot/';

    axios.get(baseUrl, {
      params: {},
      headers: {
        'Accept': '*/*',
        'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
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
  }, [props.path, state.instruments.index])

  useEffect(() => {
    console.log("contains an object", Object.keys(leftSnapshot).length > 0)
    changeToTwoColumn(Object.keys(leftSnapshot).length > 0);
  }, [leftSnapshot])

  return (
    <Grid container direction='column' className={classes.root} justify='space-between'>
      <Grid container justify='space-between'>
        {
          isTwoColumn
            ?
            <Grid item xs={6}>
              <SnapshotCard snapshot={leftSnapshot} numRows={35}/>
            </Grid>
            :
              <div></div>
        }
        <Grid container spacing={2} xs={isTwoColumn ? 6 : 12}>
          {snapshots.filter((snapshot) => {
            return(
              isTwoColumn
                ? (snapshot.instrument.location != leftSnapshot.instrument.location)
                : true
            )
            
          }).map((snapshot) => (
            <Grid item xs={isTwoColumn ? 12 : 12} md={isTwoColumn ? 12 : 6} lg={isTwoColumn ? 6 : 4} xl={isTwoColumn ? 6 : 3} onClick={() => {setLeftSnapshot(snapshot)}}>
              <SnapshotCard snapshot={snapshot} numRows={5}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
