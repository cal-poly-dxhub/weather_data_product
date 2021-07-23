import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Slider from '@material-ui/core/Slider';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

import { UserContext } from '../contexts/UserProvider';

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

// PREVIEW: Asset ID, Asset Height

function QuickMetadataItem(props) {
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
    <Grid container alignItems='center'>
      {
        ("BalloonType" in props.instrument)
          ? (
            <Grid container>
              <Grid item xs={6}>
                <QuickMetadataItem title="BALLOON TYPE" value={props.instrument.BalloonType}/>
              </Grid>
              <Grid item xs={6}>
                <QuickMetadataItem title="LAUNCH" value={props.instrument.location}/>
              </Grid>
            </Grid>
          )
          : (
            <Grid container>
              <Grid item xs={6}>
                <QuickMetadataItem title="HEIGHT" value={height}/>
              </Grid>
              <Grid item xs={6}>
                <QuickMetadataItem title="ID" value={"asset_id" in props.instrument ? props.instrument.asset_id : props.instrument.asset_ID}/>
              </Grid>  
            </Grid>
          )
      }
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
      <Table size="small" variant='outlined' aria-label="a dense table" className={classes.table} rows>
        <TableHead>
          <TableRow>
            {headers.slice(1, 5).map((header) => (
              <TableCell align="right">{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.response.gateResponses.slice(props.numRows > 5 ? 0 : props.response.gateResponses.length - props.numRows, props.response.gateResponses.length).map((row) => (
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
  )
}

// PREVIEW CARD

function PreviewCard(props) {
  const [ state, dispatch ] = React.useContext(UserContext);

  return (
    <Grid container direction='column'>
      <Grid container justify='space-around' alignItems='center' style={{marginBottom: 20}}>
        <Grid item>
          <Typography variant="h4" style={{fontWeight: 'bold'}}>
            {props.snapshot.instrument.location}
          </Typography>
        </Grid>
        <Grid item>
          <QuickMetadataRow instrument={props.snapshot.instrument} index={state.instruments.index} isMetric={props.isMetric}/>
        </Grid>
      </Grid>
      <Grid item>
        <GateResponsePreview response={props.snapshot.measurements[0]} numRows={props.numRows} isMetric={props.isMetric}/>
      </Grid>
    </Grid>
  )
}








// DETAIL CARD

function DetailCard(props) {
  const [ state, dispatch ] = React.useContext(UserContext);

  return (
    <Grid container direction='column'>
      <Grid container justify="space-evenly" alignItems="center" style={{marginBottom: 20}}>
        {/* <Grid item xs={2}>
          <Typography variant="h4" style={{ fontWeight: 'bold', textAlign: "left" }}>
            {props.snapshot.instrument.location}
          </Typography>
        </Grid> */}
        <Grid item xs={12}>
          <FullToolbar instrument={props.snapshot.instrument} index={state.instruments.index} isMetric={props.isMetric}/>
        </Grid>
      </Grid>
      <Grid item>
        <FullTable response={props.snapshot.measurements[0]} numRows={props.numRows} isMetric={props.isMetric}/>
      </Grid>
    </Grid>
  )
}

// DETAIL: Toolbar

function FullToolbar(props) {
  // const [height, setHeight] = React.useState(props.instrument.asset_height);

  const marks = [
    {
      value: 0,
      label: '5 MIN',
    },
    {
      value: 20,
      label: '4 MIN',
    },
    {
      value: 40,
      label: '3 MIN',
    },
    {
      value: 50,
      label: '2 MIN',
    },
    {
      value: 65,
      label: '1 MIN',
    },
    {
      value: 80,
      label: '45 SEC',
    },
    {
      value: 90,
      label: '30 SEC',
    },
    {
      value: 100,
      label: 'NOW',
    },
  ];
  
  function valuetext(value) {
    return `${value}°C`;
  }
  
  function valueLabelFormat(value) {
    return marks.findIndex((mark) => mark.value === value) + 1;
  }  

  // useEffect(() => {
  //   setHeight(
  //     props.isMetric 
  //     ? (0.5 * props.instrument.asset_height)
  //     : (2 * props.instrument.asset_height)
  //   )
  // }, [props.isMetric])

  return (
    <Grid container justify="space-between" alignItems="center">
      <Grid item xs={8} style={{ paddingLeft: 60, paddingRight: 60 }}>
        <Slider
          defaultValue={20}
          valueLabelFormat={valueLabelFormat}
          getAriaValueText={valuetext}
          aria-labelledby="discrete-slider-restrict"
          step={null}
          valueLabelDisplay="auto"
          marks={marks}
          style={{backgroundColor: "#2b262e"}}
        />
      </Grid>

      <Grid item xs={2}>
        <Button variant="contained" color="primary" disableElevation>
          Add to Archive
        </Button>
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
  )
}

// DETAIL: Header

function DetailHeader(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);
  const [height, setHeight] = React.useState(props.snapshot.instrument.asset_height);
  const Spacer = require('react-spacer')

  useEffect(() => {
    setHeight(
      props.isMetric 
      ? (0.5 * props.snapshot.instrument.asset_height)
      : (2 * props.snapshot.instrument.asset_height)
    )
  }, [props.isMetric])

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <IconButton edge="start" className={classes.menuButton} aria-label="units" onClick={() => {
          props.didMoveToDetail(false);
          props.highlightSnapshot("");
        }}>
          <ArrowBackIcon/>
        </IconButton>
      </div>
    
      <div item xs={1}>
        <Typography variant="h3" style={{fontWeight: "bold", textAlign: "center", paddingBottom: 20}}>
          {props.snapshot.instrument.location}
        </Typography>
      </div>

      <Spacer grow='1'/>

      <div>
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
            <Grid container>
              <Grid item xs={6}>
                <QuickMetadataItem title="HEIGHT" value={height}/>
              </Grid>
              <Grid item xs={6}>
                <QuickMetadataItem title="ID" value={"asset_id" in props.snapshot.instrument ? props.snapshot.instrument.asset_id : props.snapshot.instrument.asset_ID}/>
              </Grid>
            </Grid>  
        )}
      </div>
    </div>
  )
}








// props: snapshot, slice_min, slice_max
export default function SnapshotCard(props) {
  const classes = useStyles();
  const [height, setHeight] = React.useState(props.snapshot.instrument.asset_height);
  const [ state, dispatch ] = React.useContext(UserContext);

  // useEffect(() => {
  //   console.log("snapshot: ", props.snapshot.instrument)
  // }, [])

  useEffect(() => {
    setHeight(
      props.isMetric 
      ? (0.5 * props.snapshot.instrument.asset_height)
      : (2 * props.snapshot.instrument.asset_height)
    )
  }, [props.isMetric])

  return (
    <div style={{height: "100%"}}>
    {props.isDetail
      ? (
        <Grid container direction="column">
          { DetailHeader(props) }
          <Grid item>
            <Card className={classes.root} variant="outlined">
              <CardContent>
                {DetailCard(props)}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
      : (
        <Card className={classes.root} variant="outlined">
          <CardContent>
            {PreviewCard(props)}
          </CardContent>
        </Card>
      )
    }
    </div>
  )
}