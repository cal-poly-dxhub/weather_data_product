import React, { useState, useEffect, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Slider from '@material-ui/core/Slider';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { Grid, TableContainer } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import { UserContext } from '../contexts/UserProvider';

import { useHistory } from "react-router-dom"

const useStyles = makeStyles({
  root: {
    // minWidth: 275, 
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

// DETAIL: Toolbar

function FullToolbar(props) {
  const [state, dispatch] = useContext(UserContext);

  const marks = Array(props.numMeasurements).fill(0).map((_, i) => {
    if (i == 0) {
      return({
        value: i,
        label: (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box style={{color: "#616161"}}>{props.timestamps[i]}</Box>
            <Box>Recent</Box>
          </Box>
        )
      })   
    } else {
      return({
        value: i,
        label: <Box style={{color: "#616161"}}>{props.timestamps[i]}</Box>
      })
    }
  });

  const handleInputChange = (event, newValue) => {
    console.log(newValue)
    props.setMeasurementIndex(newValue);
  };

  return (
    <Grid container justify="space-between" alignItems="center">
      <Grid item xs={8} style={{ paddingLeft: 60, paddingRight: 60 }}>
        {
          props.numMeasurements == 1
          ? (
            undefined
          ) : (
            <Slider
              defaultValue={0}
              onChange={handleInputChange}
              track={false}
              valueLabelDisplay="off"
              aria-labelledby="discrete-slider-restrict"
              step={1}
              marks={marks}
              min={0}
              max={props.numMeasurements > 0 ? props.numMeasurements-1 : 0}
            />
          )
        }
      </Grid>
    </Grid>
  )
}

// PREVIEW: Asset ID, Asset Height

function QuickMetadataItem(props) {
  return (
    <Grid container direction='column'>
      <Grid item style={{color: 'gray', fontWeight: 'bold', textAlign: 'center'}}>
        {props.title}
      </Grid>
      <Grid item style={{color: 'white', textAlign: 'center'}}>
        {props.value}
      </Grid>
    </Grid>
  )
}

// DETAIL: Data Table

function FullTable(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const keys = Object.keys(props.response.gateResponses[0]);
    setHeaders(keys)
    // console.log("response", props)
  }, [props.response])

  return (
    <TableContainer>
      <Table size="small" variant='outlined' aria-label="a dense table" className={classes.table} rows>
        <TableHead>
          <TableRow>
            {headers.slice(1, 5).map((header) => (
              <TableCell align="right">{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.response.gateResponses.slice(0, props.response.gateResponses.length).map((row) => (
            <TableRow key={row.name}>
              {headers.slice(1, 5).map((header) => (
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
    </TableContainer>
  )
}

// DETAIL: Header

function DetailHeader(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);
  const [height, setHeight] = React.useState(props.snapshot.instrument.asset_height);
  const Spacer = require('react-spacer')
  const history = useHistory();
  const [state, dispatch] = useContext(UserContext);

  useEffect(() => {
    setHeight(
      props.isMetric 
      ? (0.5 * props.snapshot.instrument.asset_height)
      : (2 * props.snapshot.instrument.asset_height)
    )
  }, [props.isMetric])

  return (
    <Box display="flex" alignItems="center" style={{paddingBottom: "2rem"}}>
      <Box>
        <IconButton edge="start" className={classes.menuButton} aria-label="units" onClick={() => {
          history.goBack()
        }}>
          <ArrowBackIcon/>
        </IconButton>
      </Box>
    
      <Box>
        <Typography variant="h3" style={{fontWeight: "bold"}}>
          {props.snapshot.instrument.location}
        </Typography>
      </Box>

      <Spacer grow='1' width='3rem'/>

      <Box justifyContent="center">
        {("BalloonType" in props.snapshot.instrument)
          ? (
            <Grid container>
              <Grid item xs={6}>
                <QuickMetadataItem title="BALLOON TYPE" value={props.snapshot.instrument.BalloonType}/>
              </Grid>
              <Grid item xs={6}>
                <QuickMetadataItem title="LAUNCH" value={props.snapshot.instrument.location}/>
              </Grid>
            </Grid>
          )
          : (
            <Box display="flex">
              <Box>
                <QuickMetadataItem title="HEIGHT" value={height}/>
              </Box>

              <Spacer width='3rem'/>

              <Box>
                <QuickMetadataItem title="ID" value={props.snapshot.instrument.asset_id}/>
              </Box>
            </Box>  
        )}
      </Box>

      <Spacer width='3rem'/>

      <Box>
        <Button variant="contained" color="primary" disableElevation onClick={() => {
          dispatch({
            type: "exports/add",
            payload: props.archiveMetadata
          })

          // console.log(state.exports)
        }}>
          Add to Archive
        </Button>

      </Box>
    </Box>
  )
}

export default function DetailView(props) {
  const classes = useStyles();
  const [ state, dispatch ] = React.useContext(UserContext);
  const [measurementIndex, setMeasurementIndex] = useState(0);
  const [numMeasurements, setNumMeasurements] = useState(1);

  useEffect(() => {
    console.log(props.snapshot.instrument);
    setNumMeasurements(props.snapshot.measurements.length);
  }, [])

  const archiveMetadata = {
    instrument: props.instrument,
    category: props.category,
    assetID: props.snapshot.instrument.asset_id == undefined ? props.snapshot.instrument.asset_ID : props.snapshot.instrument.asset_id,
    location: props.snapshot.instrument.location,
    from: '2017-05-24T10:30',
    to: '2017-05-25T11:30'
  }

  return (
    <Box flexDirection="column" style={{paddingTop: "1rem"}}>
      <DetailHeader {...props} archiveMetadata={archiveMetadata}/>
      <Card className={classes.root} variant="outlined">
        <CardContent>
        <Box flexDirection='column'>
          <FullToolbar 
            archiveMetadata={archiveMetadata}
            numMeasurements={numMeasurements} 
            timestamps={props.snapshot.measurements.map((measurement) => {
              return measurement.metadata.measurement_date_time
            })}
            setMeasurementIndex={setMeasurementIndex} 
            isMetric={props.isMetric}/>
          <FullTable 
            response={props.snapshot.measurements[measurementIndex]} 
            numRows={props.numRows} isMetric={props.isMetric}/>
        </Box>
        </CardContent>
      </Card>
    </Box>
  )
}