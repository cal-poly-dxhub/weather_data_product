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
    borderColor: '#464646',
    backgroundColor: '#242026',
  }
});

function removeMissingData(num) {
  const regex = "[9.]+$";

  if (num == null) {
    return null
  }
  
  var str = num.toString();

  if (str.match(regex)) {
    return 'NA'
  }

  return num
}

// PREVIEW: Asset ID, Asset Height

function QuickMetadataItem(props) {
  const Spacer = require('react-spacer');

  return (
    <Box display="flex" style={{width: "100%"}}>
      <Box justifyContent="flex-end" display="flex" style={{color: 'gray', fontWeight: 'bold', minWidth: "47%"}}>
        {props.title}
      </Box>

      <Spacer grow={1}/>

      <Box style={{color: 'white', textAlign: 'leading', minWidth: "47%"}}>
        {props.value}
      </Box>
    </Box>
  )
}

// PREVIEW: Asset ID, Asset Height

function QuickMetadataRow(props) {
  const [height, setHeight] = React.useState(props.instrument.asset_height);

  useEffect(() => {
    setHeight(
      props.isMetric 
      ? (0.5 * props.instrument.asset_height)
      : (2 * props.instrument.asset_height)
    )
  }, [props.isMetric])

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
            <Grid>
              <QuickMetadataItem title="HEIGHT" value={height}/>
            </Grid>
            <Grid>
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
    const keys = Object.keys(props.response.gateResponses[0]);
    setHeaders(keys)
    // console.log("response", props)
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
          {props.response.gateResponses.slice(props.numRows > 5 ? 0 : props.response.gateResponses.length - props.numRows, props.response.gateResponses.length).map((row) => (
            <TableRow key={row.name}>
              {headers.slice(1, 4).map((header) => (
                <TableCell align="right">{
                  props.isMetric
                    ? (0.5 * removeMissingData(row[header]))
                    : (2* removeMissingData(row[header]))
                }</TableCell>
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
  const [height, setHeight] = React.useState(props.snapshot.instrument.asset_height);
  const [ state, dispatch ] = React.useContext(UserContext);
  const match = useRouteMatch()
  const Spacer = require('react-spacer');

  // useEffect(() => {
  //   console.log(`${match.path}/${props.snapshot.instrument.location}/detail`)
  // }, [])

  useEffect(() => {
    setHeight(
      props.isMetric 
      ? (0.5 * props.snapshot.instrument.asset_height)
      : (2 * props.snapshot.instrument.asset_height)
    )
  }, [props.isMetric])

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
              <QuickMetadataRow 
              instrument={props.snapshot.instrument} 
              index={state.instruments.index} 
              isMetric={props.isMetric}/>
            </Box>

            <Spacer grow={1}/>
          </Box>

          <Spacer width={20}/>

          <TableContainer>
            <GateResponsePreview 
            response={props.snapshot.measurements[0]} 
            numRows={props.numRows} 
            isMetric={props.isMetric}/>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  )
}