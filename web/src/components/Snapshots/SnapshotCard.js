import React, { useState, useEffect } from 'react';

import GoogleMapReact from 'google-map-react';

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
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Typography } from '@material-ui/core';
import { Box } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'


import MetadataItem from '../Misc/MetadataItem'
import { UserContext } from '../../contexts/UserProvider';

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

function QuickMetadataColumn(props) {
  return (
    "BalloonType" in props.instrument)
        ? (
          <Grid container direction="column">
            <Grid item>
              <MetadataItem title="BALLOON TYPE" value={props.instrument.BalloonType}/>
            </Grid>
            <Grid item>
              <MetadataItem title="LAUNCH" value={props.instrument.location}/>
            </Grid>
          </Grid>
        )
        : (
          <Grid container direction="column">
            <Grid item>
              <MetadataItem title="HEIGHT" value={`${props.instrument.asset_height} ${props.isMetric ? 'm' : 'ft'}`}/>
            </Grid>
            <Grid item>
              <MetadataItem title="ID" value={"asset_id" in props.instrument ? props.instrument.asset_id : props.instrument.asset_ID}/>
            </Grid>  
          </Grid>
        )
}

// PREVIEW: Table Data

function GateResponsePreview(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
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
        case "dir":
          keys[index] = key + " (deg)";
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
              <TableCell align="right" key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.response.gateResponses.slice(-5).map((row, index) => (
            <TableRow key={index}>
              {Object.keys(props.response.gateResponses[0]).slice(1, 4).map((header) => (
                <TableCell align="right" key={`${index}_${header}`}>
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
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
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
          <Box alignContent="center" flexGrow={1} flexDirection='column' display="flex" style={{minWidth: "150px"}}>
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

          {props.instrumentType == "tower" ? (
            <Box style={{ height: '175px', minWidth: '50%', borderRadius: 5, overflow: "hidden" }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyCpDdUirt6fRgnMFCuORsAQXOC3hBsBVg0'}}
                defaultCenter={{lat: props.center.lat, lng: props.center.lng}}
                defaultZoom={15}
                yesIWantToUseGoogleMapApiInternals
                options={map => ({
                  fullscreenControl: false,
                  mapTypeId: map.MapTypeId.SATELLITE,
                  clickableIcons: false,
                  zoomControl: false,
                  disableDoubleClickZoom: true,
                  streetViewControl: false,
                  gestureHandling: "greedy",
                })}
              >
                <LocationOnIcon lat={props.center.lat} lng={props.center.lng} style={{color: "black"}}/>
              </GoogleMapReact>
            </Box>
          ) : (
            <TableContainer style={{maxWidth: "100%"}}>
              <GateResponsePreview 
              response={props.isMetric && Object.keys(metricSnapshot).length != 0 ? metricSnapshot.measurements[0] : props.snapshot.measurements[0]} 
              numRows={props.numRows} 
              isMetric={props.isMetric}
              units={props.snapshot.units}/>
            </TableContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}