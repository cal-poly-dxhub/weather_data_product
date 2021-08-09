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

const IMP_TO_MET_DIST = 0.3047851265;   // MARK: Feet to meters
const IMP_TO_MET_RATE = 0.3047851265;   // MARK: Feet/s to meters/s

const ROOT_PLACEHOLDER = {asset_name: "Root"}

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
  const [metricSnapshots, setMetricSnapshots] = React.useState([]);
  const [metadata, setMetadata] = useState([ROOT_PLACEHOLDER]);
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
        setMetadata(resp.data);

        props.apiManager.sendSnapshotRequest(
          state.instruments[props.instrument].path,
          state.instruments[props.instrument][props.category] ? state.instruments[props.instrument][props.category].path : null
        ).then((snapshotsData) => {
          setSnapshots(snapshotsData);

          dispatch({
            type: "instruments/data",
            payload: {
              key: key,
              data: snapshotsData
            }
          });
  
          converToMetric(snapshotsData);
        });
      });
    } catch (err) {
        console.error("metadata error: ", err);
    }
  }

  const converToMetric = (data) => {
    const clone = JSON.parse(JSON.stringify(data))

    clone.forEach((snapshot) => {
      if ("asset_height" in snapshot.instrument) {
        snapshot.instrument.asset_height = (snapshot.instrument.asset_height * IMP_TO_MET_DIST).toFixed(4);
      }
      
      snapshot.measurements.forEach((measurement) => {
        measurement.gateResponses.forEach((gateResponse) => {
          Object.keys(gateResponse).forEach((key, index) => {
            let unitType = snapshot.units[key];

            if (props.apiManager.isMissing(gateResponse[key])) {
              gateResponse[key] = "NaN";
            } else {
              switch (unitType) {
                case "dist":
                  gateResponse[key] = (IMP_TO_MET_DIST * gateResponse[key]).toFixed(2);
                  break;
                case "rate":
                  gateResponse[key] = (IMP_TO_MET_RATE * gateResponse[key]).toFixed(2);
                  break;
                case "temp":
                  gateResponse[key] = ((gateResponse[key] -32) * 5/9).toFixed(2);
                  break;
                default:
                  break;
              }
            }
          });
        });
      });
    });

    setMetricSnapshots(clone);
  }

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

        const columns = [];

        resp.data.forEach(tower_code => {
          let column = {
            field: tower_code.code,
            headerName: tower_code.description
          }

          columns.push(column);
        });

        setTowerColumns(columns);
        setSnapshots(tower_data);
      });
    } catch (err) {
        console.error("get error: ", err);
    }
  };

  useEffect(() => { 
    props.setFocusedSnapshot({});
    setMetricSnapshots([]);
    setSnapshots([]);
    setMetadata([ROOT_PLACEHOLDER]);

    const key = props.instrument + "/" + props.category

    if (state.instruments[props.instrument].data != null && 
      state.instruments[props.instrument].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument].data);
      converToMetric(state.instruments[props.instrument].data);
    } else if (props.category != "" && 
      state.instruments[props.instrument][props.category] != null && 
      state.instruments[props.instrument][props.category].data != null && 
      state.instruments[props.instrument][props.category].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument][props.category].data);
      converToMetric(state.instruments[props.instrument][props.category].data);
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
              key={(("BalloonName" in meta) ? meta.BalloonName : meta.asset_name) + "_" + props.instrument} 
              sm={6}
              md={6}
              lg={6}
              xl={4}
              style={{height: "17rem", minWidth: matchesSm ? "100%" : "Auto"}}>
                <PlaceholderCard/>
            </Grid>
          ))     
        ) : (
          props.instrument == "tower" ?
          (
            <div style={{color: "white", textAlign: "center", minWidth: "100%", paddingTop: "10rem", fontWeight: "bold", color: "gray"}}>Sorry, we're working on it!</div>
          ) : (
            snapshots.map((snapshot, index) => (
              <Grid item 
                key={snapshot.instrument.asset_id + "_" + props.instrument}
                sm={6}
                md={6}
                lg={6}
                xl={4}
                style={{minWidth: matchesSm ? "100%" : "Auto"}}
                onClick={() => {
                  props.setFocusedSnapshot(snapshot);
                  props.setFocusedSnapshotMetric(metricSnapshots[index]);
                }}>
                  {/* <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={true}>
                    <CircularProgress color="inherit" />
                  </Backdrop> */}
                  <Link to={`${match.path}/${snapshot.instrument.location}/detail`} style={{textDecoration: "none"}}>
                    <SnapshotCard 
                      snapshot={snapshot} 
                      metricSnapshot={metricSnapshots[index]}
                      category={props.category}
                      numRows={5}
                      isMetric={!state.settings.imperial} 
                    />
                  </Link>
              </Grid>
            ))
          )
        )
      }
    </Grid>
  );
}