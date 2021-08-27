import React, { useState, useEffect, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useMediaQuery } from '@material-ui/core';

import { useRouteMatch, useHistory, Link } from "react-router-dom"

import theme from '../../theme'

import SnapshotCard from './SnapshotCard';
import PlaceholderCard from '../Misc/PlaceholderCard';
import { UserContext } from '../../contexts/UserProvider';

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
    marginRight: "16px",
    borderRadius: "8px",
  }
}));

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [metricSnapshots, setMetricSnapshots] = React.useState([]);
  const [columns, setColumns] = useState([]);
  const [state, dispatch] = useContext(UserContext);
  const history = useHistory();
  const match = useRouteMatch();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (snapshots.length > 0) {
      let metricSnapshots = props.apiManager.convertToMetric(snapshots);
      setMetricSnapshots(metricSnapshots);  
    }

    if (props.instrumentName == "tower" && columns.length <= 0) {
      let columnsToSave = props.apiManager.sendTowerCodesRequest();
      setColumns(columnsToSave);
    }
  }, [snapshots]);

  useEffect(() => {
    if (metricSnapshots.length > 0 && props.instrumentName != "tower") {
      props.setGoBack(false);
    }
  }, [metricSnapshots]);

  useEffect(() => {
    if (columns.length > 0) {
      props.setGoBack(false);
    }
  }, [columns]);

  useEffect(() => { 
    props.setInstrument(props.instrumentName);
    props.setCategory(props.categoryName);
    props.setFocusedSnapshot({});
    setSnapshots([]);

    const key = props.instrumentName + "/" + props.categoryName;

    const saveCallback = (dataToSave) => dispatch({
      type: "instruments/data",
      payload: {
        key: key,
        data: dataToSave
      }
    });  


    switch (props.instrumentName) {
      case "profiler":
        if (state.instruments["profiler"][props.categoryName].data.length > 0) { 
          let recover = state.instruments["profiler"][props.categoryName].data;
          setSnapshots(recover);
          break; 
        }

        props.apiManager.sendSnapshotRequest(state.instruments["profiler"].path, state.instruments["profiler"][props.categoryName].path)
        .then((data) => {
          setSnapshots(data);
          saveCallback(data);
        });

        break;
      case "tower":
        props.apiManager.sendTowerCodesRequest()
        .then(columnsToSave => {
          setColumns(columnsToSave);

          if (state.instruments["tower"].data.length > 0) {
            let recover = state.instruments["tower"].data;
            setSnapshots(recover);
          } else {
            props.apiManager.sendSnapshotRequest(state.instruments["tower"].path, "")
            .then((data) => {
              let towerSnapshotsData = props.apiManager.mapCodesToSnapshotData(data, columnsToSave);
              setSnapshots(towerSnapshotsData);
              saveCallback(towerSnapshotsData);
            });  
          }
        });  

        break;
      default:
        if (state.instruments[props.instrumentName].data.length > 0) {
          let recover = state.instruments[props.instrumentName].data;
          setSnapshots(recover);
          break; 
        }

        props.apiManager.sendSnapshotRequest(state.instruments[props.instrumentName].path, "")
        .then((data) => {
          setSnapshots(data);
          saveCallback(data);
        });

        break;
    }
  }, [props.instrumentName, props.categoryName]);

  if (snapshots.length <= 0 || metricSnapshots.length <= 0) {
    return (
      <Grid container className={classes.root} style={{minWidth: "100%"}} spacing={3}>
          {props.metadata.map((meta) => (
            <Grid item 
              key={(("BalloonName" in meta) ? meta.BalloonName : meta.archive_number) + "_" + props.instrumentName} 
              sm={6}
              md={6}
              lg={4}
              xl={3}
              style={{height: "17rem", minWidth: matchesSm ? "100%" : "Auto"}}>
                <PlaceholderCard/>
            </Grid>
          ))}
      </Grid>
    );
  } else {
    return (
      <Grid container className={classes.root} style={{minWidth: "100%"}} spacing={3}>
          {snapshots.map((snapshot, index) => (
            <Grid item 
              key={("BalloonName" in snapshot.instrument ? snapshot.instrument.BalloonName : snapshot.instrument.asset_id) + "_" + props.instrumentName}
              sm={6}
              md={6}
              lg={4}
              xl={3}
              style={{minWidth: matchesSm ? "100%" : "Auto"}}
              onClick={() => {
                props.setFocusedSnapshot(snapshot);
                props.setFocusedSnapshotMetric(metricSnapshots[index]);
                props.setFocusedColumns(props.instrumentName == "tower" ? columns : []);
              }}>
                <Link to={`${match.url}/detail/${"BalloonName" in snapshot.instrument ? snapshot.instrument.BalloonName : snapshot.instrument.asset_id}`} style={{textDecoration: "none"}}>
                  <SnapshotCard 
                    snapshot={snapshot} 
                    instrumentType={props.instrumentName}
                    columns={columns}
                    metricSnapshot={metricSnapshots[index]}
                    category={props.categoryName}
                    numRows={5}
                    metadata={props.metadata[index]}
                    isMetric={!state.settings.imperial} 
                  />
                </Link>
            </Grid>
          ))}
      </Grid>
    );
  }
}