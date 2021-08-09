import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';

import { useRouteMatch, Switch, Route, useHistory } from "react-router-dom"

import { UserContext } from '../contexts/UserProvider';
import DetailView from './DetailView';

const useStyles = makeStyles({
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: '#242026',
    '&:hover': {
      borderColor: '#ffffff',
    }
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  menuButton: {
    color: '#9E9C98'
  },
  table: {
    maxWidth: "100%",
    borderColor: '#464646',
    backgroundColor: '#242026',
  }
});

// PREVIEW: Asset ID, Asset Height

function QuickMetadataItem(props) {
  const Spacer = require('react-spacer');

  return (
    <Box display="flex" style={{width: "100%"}} justifyContent="center">
      <Spacer grow={1}/>

      <Box justifyContent="flex-end" style={{color: 'gray', fontWeight: 'bold', verticalAlign: "right", textAlign: "right", width: "50%"}}>
        {props.title}
      </Box>

      <Spacer width={5}/>

      <Box style={{color: 'white', textAlign: 'left', width: "50%"}}>
        {props.value}
      </Box>

      <Spacer grow={1}/>
    </Box>
  )
}

// PREVIEW: Asset ID, Asset Height

function QuickMetadataColumn(props) {
  return (
    "BalloonType" in props.instrument)
        ? (
          <Grid container direction="column">
            <Grid item>
              <QuickMetadataItem title="BALLOON TYPE" value={props.instrument.BalloonType}/>
            </Grid>
            <Grid item>
              <QuickMetadataItem title="LAUNCH" value={props.instrument.location}/>
            </Grid>
          </Grid>
        )
        : (
          <Grid container direction="column">
            <Grid item>
              <QuickMetadataItem title="HEIGHT" value={`${props.instrument.asset_height} ${props.isMetric ? 'm' : 'ft'}`}/>
            </Grid>
            <Grid item>
              <QuickMetadataItem title="ID" value={"asset_id" in props.instrument ? props.instrument.asset_id : props.instrument.asset_ID}/>
            </Grid>  
          </Grid>
        )
}

// PREVIEW: Table Data

function GateResponsePreview(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    console.log("response changed: ", props.response.gateResponses[0]);
    let keys = Object.keys(props.response.gateResponses[0]);
    keys.forEach((key, index) => {
      switch (props.units[key]) {
        case "dist":
          keys[index] = key + (props.isMetric ? " (m)" : " (ft)");
          break;
        case "rate":
          keys[index] = key + (props.isMetric ? " (m/s)" : " (ft/s)");
          break;
        case "temp":
          keys[index] = key + (props.isMetric ? " (C)" : " (F)");
          break;
        default:
          break;
      };
    });
    setHeaders(keys)
  }, [props.response])

  return (
      <Table size="small" aria-label="a dense table" className={classes.table}>
        <TableHead>
          <TableRow>
            {headers.slice(1, 4).map((header) => (
              <TableCell align="right">{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.response.gateResponses.slice(-5).map((row) => (
            <TableRow key={row.name}>
              {Object.keys(props.response.gateResponses[0]).slice(1, 4).map((header) => (
                <TableCell align="right">
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}

// props: snapshot, slice_min, slice_max
export default function SnapshotCard(props) {
  const classes = useStyles();
  const [ state, dispatch ] = React.useContext(UserContext);
  const [metricSnapshot, setMetricSnapshot] = React.useState({});
  const Spacer = require('react-spacer');

  // useEffect(() => {
  //   console.log(`${match.path}/${props.snapshot.instrument.location}/detail`)
  // }, [])

  useEffect(() => {
    if (props.metricSnapshot != undefined && props.metricSnapshot != null && Object.keys(props.metricSnapshot).length > 0) {
      setMetricSnapshot(props.metricSnapshot);
    }

  }, [props.metricSnapshot])

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Box flexDirection='row' display="flex">
          <Box flexDirection='column' display="flex" style={{minWidth: "35%"}}>
            <Spacer grow={1}/>

            <Box display="flex" alignItems="center" justifyContent="center">
              <Typography variant="h4" style={{fontWeight: 'bold', textAlign: "center"}}>
                {props.snapshot.instrument.location}
              </Typography>
            </Box>

            <Spacer height={10}/>

            <Box>
              <QuickMetadataColumn 
              instrument={props.isMetric && Object.keys(metricSnapshot).length != 0  ? metricSnapshot.instrument : props.snapshot.instrument} 
              index={state.instruments.index} 
              isMetric={props.isMetric}/>
            </Box>

            <Spacer grow={1}/>
          </Box>

          <Spacer width={20}/>

          <TableContainer style={{maxWidth: "100%"}}>
            <GateResponsePreview 
            response={props.isMetric && Object.keys(metricSnapshot).length != 0 ? metricSnapshot.measurements[0] : props.snapshot.measurements[0]} 
            numRows={props.numRows} 
            isMetric={props.isMetric}
            units={props.snapshot.units}/>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  )
}