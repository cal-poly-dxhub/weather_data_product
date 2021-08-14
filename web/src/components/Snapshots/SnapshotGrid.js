import React, { useState, useEffect, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { useMediaQuery } from '@material-ui/core';

import { useRouteMatch, useHistory, Link } from "react-router-dom"

import theme from '../../theme'

import SnapshotCard from './SnapshotCard';
import PlaceholderCard from '../Misc/PlaceholderCard';
import { UserContext } from '../../contexts/UserProvider';

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
    marginRight: "16px",
    borderRadius: "8px",
  }
}));

export default function SnapshotGrid(props) {
  const classes = useStyles();
  const [snapshots, setSnapshots] = useState([]);
  const [metricSnapshots, setMetricSnapshots] = React.useState([]);
  const [metadata, setMetadata] = useState([ROOT_PLACEHOLDER]);
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

    if (props.instrument == "tower" && columns.length <= 0) {
      let columnsToSave = props.apiManager.sendTowerCodesRequest();
      setColumns(columnsToSave);
    }
  }, [snapshots])

  useEffect(() => { 
    props.setFocusedSnapshot({});
    setMetricSnapshots([]);
    setSnapshots([]);
    setColumns([]);
    setMetadata([ROOT_PLACEHOLDER]);

    const key = props.instrument + "/" + props.category

    if (state.instruments[props.instrument].data != null && 
      state.instruments[props.instrument].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument].data);

      if (props.instrument == "tower") {
        props.apiManager.sendTowerCodesRequest()
        .then(columnsToSave => {
          setColumns(columnsToSave);
        });
      }
    } else if (props.category != "" && 
      state.instruments[props.instrument][props.category] != null && 
      state.instruments[props.instrument][props.category].data != null && 
      state.instruments[props.instrument][props.category].data.length > 0) 
    {
      setSnapshots(state.instruments[props.instrument][props.category].data);
    } else {
      let instrumentPath = state.instruments[props.instrument].path;
      let categoryPath = state.instruments[props.instrument][props.category] ? state.instruments[props.instrument][props.category].path : null;
      
      props.apiManager.sendMetadataRequest(
        instrumentPath,
        categoryPath
      ).then((metadata) => {
        setMetadata(metadata);

        props.apiManager.sendSnapshotRequest(
          instrumentPath,
          categoryPath
        ).then((snapshotsData) => {
          switch (props.instrument) {
            case "tower":
              props.apiManager.sendTowerCodesRequest()
              .then(columnsToSave => {
                setColumns(columnsToSave);

                let towerSnapshotsData = props.apiManager.mapCodesToSnapshotData(snapshotsData, columnsToSave);
                setSnapshots(towerSnapshotsData);
  
                dispatch({
                  type: "instruments/data",
                  payload: {
                    key: key,
                    data: towerSnapshotsData
                  }
                });
              });

              break;
            default:
              setSnapshots(snapshotsData);

              dispatch({
                type: "instruments/data",
                payload: {
                  key: key,
                  data: snapshotsData
                }
              });        
              break;
          }
        });
      });
    }
  }, [props.instrument, props.category]);

  useEffect(() => {
    props.setInstrument(props.instrument);
  }, [])

  if (snapshots.length <= 0 || metricSnapshots.length <= 0) {
    return (
      <Grid container className={classes.root} style={{minWidth: "100%", paddingTop: "1rem"}} spacing={3}>
          {metadata.map((meta) => (
            <Grid item 
              key={(("BalloonName" in meta) ? meta.BalloonName : meta.archive_number) + "_" + props.instrument} 
              sm={6}
              md={6}
              lg={6}
              xl={4}
              style={{height: "17rem", minWidth: matchesSm ? "100%" : "Auto"}}>
                <PlaceholderCard/>
            </Grid>
          ))}
      </Grid>
    );
  } else {
    return (
      <Grid container className={classes.root} style={{minWidth: "100%", paddingTop: "1rem"}} spacing={3}>
          {snapshots.map((snapshot, index) => (
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
                props.setFocusedColumns(props.instrument == "tower" ? columns : []);
              }}>
                <Link to={`${match.path}/${snapshot.instrument.location}/detail`} style={{textDecoration: "none"}}>
                  <SnapshotCard 
                    snapshot={snapshot} 
                    columns={columns}
                    metricSnapshot={metricSnapshots[index]}
                    category={props.category}
                    numRows={5}
                    isMetric={!state.settings.imperial} 
                  />
                </Link>
            </Grid>
          ))}
      </Grid>
    );
  }
}