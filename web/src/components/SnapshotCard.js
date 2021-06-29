import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  root: {
    minWidth: 275, 
    '&:hover': {
      
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

function QuickMetadata(props) {
  return (
    <Grid container direction='column' style={{marginLeft: 30}}>
      <Grid item style={{color: 'gray', fontWeight: 'bold', textAlign: 'center', marginTop: 10}}>
        {props.title}
      </Grid>
      <Grid item style={{color: 'white', textAlign: 'center'}}>
        {props.value}
      </Grid>
    </Grid>
  )
}

function QuickMetadataGrid(props) {
  return (
    <Grid container alignItems='center' justify='space-between'>
      <Grid container direction='column' xs={6}>
        <Grid item xs={6}>
          <QuickMetadata title="ID" value={props.instrument.tower_id}/>
        </Grid>
        {/* <Grid item xs={6}>
          <QuickMetadata title="LAT" value={props.instrument.latitude}/>
        </Grid> */}
      </Grid>
      <Grid container direction='column' xs={6}>
        <Grid item xs={6}>
          <QuickMetadata title="HEIGHT" value={props.instrument.height}/>
        </Grid>
        {/* <Grid item xs={6}>
          <QuickMetadata title="LONG" value={props.instrument.longitude}/>
        </Grid> */}
      </Grid>
    </Grid>
  )
}

function GateResponsePreview(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const keys = Object.keys(props.response.gateResponses[0]);
    setHeaders(keys)
    console.log("response", props)
  }, [])

  return (
      <Table size="small" variant='outlined' aria-label="a dense table" className={classes.table} rows>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell align="right">{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.response.gateResponses.slice(0, 3).map((row) => (
            <TableRow key={row.name}>
              {headers.map((header) => (
                <TableCell align="right">{removeMissingData(row[header])}</TableCell>
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

  useEffect(() => {
    console.log("instrument", props.snapshot.instrument)
  }, [])

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Grid container direction='column'>
          <Grid container justify='space-around' alignItems='center' style={{marginBottom: 20}}>
            <Grid item>
              <Typography variant="h4" style={{fontWeight: 'bold'}}>
                {props.snapshot.instrument.asset_name}
              </Typography>
            </Grid>
            <Grid item>
              <QuickMetadataGrid instrument={props.snapshot.instrument}/>
            </Grid>
          </Grid>
          <Grid item>
            <GateResponsePreview response={props.snapshot.measurements[0]}/>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}