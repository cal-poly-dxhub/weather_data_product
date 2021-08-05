import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { BorderColor } from '@material-ui/icons';
import { Card, CardContent } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';

import { SpringGrid, measureItems, makeResponsive, enterExitStyle } from 'react-stonecutter';
import Shimmer from "react-shimmer-effect";

import { useRouteMatch, useHistory, Link } from "react-router-dom"

import theme from '../theme'

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
  // circle: {
  //   height: "56px",
  //   width: "56px",
  //   borderRadius: "50%"
  // },
  line: {
    width: "100%",
    height: "15px",
    alignSelf: "center",
    // marginLeft: "16px",
    marginRight: "16px",
    borderRadius: "8px",
  }
}));

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [state, dispatch] = useContext(UserContext);
  const history = useHistory();
  const match = useRouteMatch();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    props.setFocusedSnapshot({});
    // props.setInstrument(lastItem);
    // didMoveToDetail(false)
    // highlightSnapshot({})
    // history.push(`${match.url}/${props.instrument}`)
  }, [])

  const sendGetRequest = async (key) => {
    try {
      const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + state.instruments[props.instrument].path 
      + (state.instruments[props.instrument][props.category] != undefined ? state.instruments[props.instrument][props.category].path : "") 
      + "snapshot/";

      const resp = await axios.get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      });

      console.log("wowieeeee: ", resp.data)

      setSnapshots(resp.data)
      dispatch({
        type: "instruments/data",
        payload: {
          key: key,
          data: resp.data
        }
      })
    } catch (err) {
        console.error("async error: ", err);
    }
  };

  useEffect(() => {
    const key = props.instrument + "/" + props.category

    if (state.instruments[props.instrument].data != undefined && 
      state.instruments[props.instrument].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument].data)
    } else if (props.category != "" && 
      state.instruments[props.instrument][props.category] != undefined && 
      state.instruments[props.instrument][props.category].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument][props.category].data)
    } else {
      sendGetRequest(key)
    }
  }, [props.instrument, props.category])

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const locations = ["LF06", "Motor Pool", "LF-03", "Boathouse", "SLC-3", "HSF", "NASA", "Diosa Rd", "Taurus", "MM", "WR1"]
  return (    
    <Grid container className={classes.root} style={{minWidth: "100%", paddingTop: "1rem"}} spacing={3}>
      {snapshots.length == 0 ?
        (
          [...Array(getRandomInt(1, 10)).keys()].map((customKey) => (
            <Grid item>
              <Card style={{backgroundColor: "#242026", width: "100%", height: "100%"}} variant="outlined">
                <CardContent style={{backgroundColor: "#242026"}}>
                  <Grid container direction="column">
                    <Shimmer>
                      <div className={classes.line}/>
                    </Shimmer>
                    <div/>
                    <Shimmer>
                      <div className={classes.line}/>
                    </Shimmer>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))        
        ) : (
          snapshots.map((snapshot) => (
            <Grid item 
              sm={6}
              md={6}
              lg={4}
              xl={3}
              style={{minWidth: matchesSm ? "100%" : "Auto"}}
              onClick={() => {
                props.setFocusedSnapshot(snapshot);
                history.push(`${match.path}/${snapshot.instrument.location}/detail`)
              }}>
                <SnapshotCard 
                  snapshot={snapshot} 
                  category={props.category}
                  numRows={5}
                  isMetric={state.settings.imperial} 
                />
            </Grid>
          ))
        )
      }
    </Grid>
  );
}