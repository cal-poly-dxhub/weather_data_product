import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useMediaQuery } from '@material-ui/core';

import { useRouteMatch, useHistory, Link } from "react-router-dom"

import theme from '../theme'

import SnapshotCard from './SnapshotCard';
import PlaceholderCard from './PlaceholderCard';
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
  rect: {
    minWidth: "100%",
    minHeight: "100%",
    borderRadius: "5%",
    alignSelf: "center",
  },
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
  const [metadata, setMetadata] = useState([]);
  const [towerColumns, setTowerColumns] = useState([]);
  const [state, dispatch] = useContext(UserContext);
  const history = useHistory();
  const match = useRouteMatch();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const sendMetadataRequest = (key) => {
    try {
      let baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + state.instruments[props.instrument].path 
      + (state.instruments[props.instrument][props.category] ? state.instruments[props.instrument][props.category].path : "")

      baseUrl = baseUrl.slice(0, -1);
      console.log(baseUrl)

      axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
        console.log("metadata: ", resp.data)
        setMetadata(resp.data);
        console.log("why count: ", metadata.length)

        sendSnapshotRequest(key);
      });
    } catch (err) {
        console.error("metadata error: ", err);
    }
  }

  const sendSnapshotRequest = (key) => {
    try {
      const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + state.instruments[props.instrument].path 
      + (state.instruments[props.instrument][props.category] ? state.instruments[props.instrument][props.category].path : "") 
      + "snapshot?units=true";

      axios
      .get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
        console.log("data: ", resp.data)

        if (props.instrument == "tower") {
          handleTowerProductCodes(resp.data)
        } else {
          setSnapshots(resp.data);
          console.log("why 2 count: ", metadata.length)
          // setMetadata([]);

          dispatch({
            type: "instruments/data",
            payload: {
              key: key,
              data: resp.data
            }
          });
        }
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  };

  const handleTowerProductCodes = (tower_data) => {
    try {

      axios
      .get('https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/tower/codes' , {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      })
      .then((resp) => {
        console.log("codes: ", resp.data);

        const columns = []

        resp.data.forEach(tower_code => {
          let column = {
            field: tower_code.code,
            headerName: tower_code.description
          }

          columns.push(column);
        });

        setTowerColumns(columns);
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  };

  useEffect(() => { 
    props.setFocusedSnapshot({});
    setSnapshots([]);
    setMetadata([]);

    const key = props.instrument + "/" + props.category

    if (state.instruments[props.instrument].data != null && 
      state.instruments[props.instrument].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument].data)
    } else if (props.category != "" && 
      state.instruments[props.instrument][props.category] != null && 
      state.instruments[props.instrument][props.category].data != null && 
      state.instruments[props.instrument][props.category].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument][props.category].data)
    } else {
      sendMetadataRequest(key);
    }
  }, [props.instrument, props.category]);

  useEffect(() => {
    props.setInstrument(props.instrument);
  }, [])

  return (    
    <Grid container className={classes.root} style={{minWidth: "100%", paddingTop: "1rem"}} spacing={3}>
      {snapshots.length <= 0 ?
        (
          metadata.map((meta) => (
            <Grid item 
              key={meta.asset_name} 
              sm={6}
              md={6}
              lg={4}
              xl={3}
              style={{height: "17rem", minWidth: matchesSm ? "100%" : "Auto"}}>
                <PlaceholderCard/>
            </Grid>
          ))     
        ) : (
          snapshots.map((snapshot) => (
            <Grid item 
              key={snapshot.instrument.asset_id}
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