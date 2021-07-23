import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { BorderColor } from '@material-ui/icons';
import { Card, CardContent } from '@material-ui/core';

import { SpringGrid, measureItems, makeResponsive, enterExitStyle } from 'react-stonecutter';
import Shimmer from "react-shimmer-effect";

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
  // circle: {
  //   height: "56px",
  //   width: "56px",
  //   borderRadius: "50%"
  // },
  line: {
    width: "340px",
    height: "8px",
    alignSelf: "center",
    marginLeft: "16px",
    borderRadius: "8px",
  }
}));

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotHighlighted, highlightSnapshot] = useState({});
  const [isInDetail, didMoveToDetail] = useState(false);
  const [state, dispatch] = useContext(UserContext);

  const { enter, entered, exit } = enterExitStyle.foldUp;

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
    didMoveToDetail(Object.keys(snapshotHighlighted).length > 0)
  }, [snapshotHighlighted])

  useEffect(() => {
    const key = props.instrument + "/" + props.category

    setSnapshots([]);
    didMoveToDetail(false);
    highlightSnapshot("");

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

  const CustomGrid = makeResponsive(SpringGrid, {
    maxWidth: 1920,
    minPadding: 100
  });

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const locations = ["LF06", "Motor Pool", "LF-03", "Boathouse", "SLC-3", "HSF", "NASA", "Diosa Rd", "Taurus", "MM", "WR1"]
  return (    
    <Grid container className={classes.root} justify='center'>
      <CustomGrid
        component="ul"
        columns={isInDetail ? 1 : 3}
        columnWidth={isInDetail ? 1000 : 375}
        gutterWidth={40}
        gutterHeight={40}
        itemHeight={308}
        springConfig={{ stiffness: 170, damping: 26 }}
        style={{listStyle: "none"}}
        enter={enter}
      >
      {snapshots.length == 0 ?
        (
          [...Array(getRandomInt(1, 10)).keys()].map((customKey) => (
            <li key={locations[customKey]}>
              <Card style={{backgroundColor: "#242026", width: "400px", height: "335px"}} variant="outlined">
                <CardContent style={{backgroundColor: "#242026"}}>
                  <Shimmer>
                    <div className={classes.line}/>
                  </Shimmer>
                </CardContent>
              </Card>
            </li>
          ))        
        ) : (
          snapshots
            .filter((snapshot) => (
              isInDetail
                ? snapshotHighlighted.instrument.location == snapshot.instrument.location
                : true
            ))
            .map((snapshot) => (
              <li key={snapshot.instrument.location} style={{width: isInDetail ? "100%" : "400px", height: isInDetail ? "Auto" : "335px"}} onClick={() => {
                if (!isInDetail) {
                  highlightSnapshot(snapshot)
                }
                }}>
                <SnapshotCard 
                  snapshot={snapshot} 
                  numRows={5} 
                  isMetric={state.settings.imperial} 
                  isDetail={isInDetail && snapshotHighlighted.instrument.location == snapshot.instrument.location}
                  highlightSnapshot={highlightSnapshot}
                  didMoveToDetail={didMoveToDetail}
                />
              </li>
            ))
        )
      }
      </CustomGrid>
    </Grid>
  );
}