import React, { useState, useEffect } from 'react';

import GoogleMapReact from 'google-map-react';

import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
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
    border: "solid", 
    backgroundColor: '#242026',
    borderColor: "#4a4a4a", 
    '&:hover': {
      borderColor: 'gray',
    },
    minHeight: "17rem",
    borderWidth: "2px", 
    overflow: "hidden", 
    borderRadius: "10px",
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
      <Table size="small" aria-label="a dense table" style={{backgroundColor: "#2b272e"}}>
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
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const [ center, setCenter ] = React.useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (props.metadata && props.metadata.latitude && props.metadata.longitude) {
      setCenter({
        lat: props.metadata.latitude,
        lng: props.metadata.longitude
      });  
    }
  }, [props.metadata, props.metricSnapshot])

  useEffect(() => {
    if (props.metricSnapshot != undefined && props.metricSnapshot != null && Object.keys(props.metricSnapshot).length > 0) {
      setMetricSnapshot(props.metricSnapshot);
    }

  }, [props.metricSnapshot])

  return (
    <Box 
      className={classes.root} 
      flexDirection={matchesXs ? "column" : "row"} 
      display="flex"
      justifyItems="center"
    >
      <Box 
        alignContent="center" 
        flexGrow={1} 
        flexDirection='column' 
        display="flex" 
        style={{
          // backgroundColor: "black",
          maxWidth: "150px", 
          minWidth: matchesXs ? "100%" : "150px",
          paddingLeft: matchesXs ? 0 : props.instrumentType == "tower" ? "40px" : "20px"
        }}
      >
        <Spacer grow={1} height={15}/>

        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography 
            variant={props.snapshot.instrument.location.length > 15 ? "h4" : "h3"} 
            style={{fontWeight: 'bold', textAlign: "center"}}
          >
            {props.snapshot.instrument.location}
          </Typography>
        </Box>

        <Spacer height={10}/>

        <Box>
          <QuickMetadataColumn 
            instrument={props.isMetric && Object.keys(metricSnapshot).length != 0  ? metricSnapshot.instrument : props.snapshot.instrument} 
            index={state.instruments.index} 
            isMetric={props.isMetric}
          />
        </Box>

        <Spacer grow={1} height={10}/>
      </Box>

      <Box 
        display="flex" 
        alignItems="center" 
        flexGrow={1} 
        style={{
          minHeight: "100%", 
          minWidth: '50%', 
          borderRadius: 5, 
          overflow: "hidden",
          paddingLeft: matchesXs ? 20 : 10,
          paddingRight: matchesXs ? 20 : 20,
          paddingBottom: 15,
          paddingTop: 15
        }}
      >
        <Spacer grow={1}/>
        {props.instrumentType == "tower" ? (
          <div style={{minWidth: matchesXs ? "100%" : "90%", height: matchesXs ? 200 : "100%", overflow: "hidden", borderRadius: "5px"}}>
            {center.lat != 0 ? (
                <GoogleMapReact
                  bootstrapURLKeys={{ key: 'AIzaSyCpDdUirt6fRgnMFCuORsAQXOC3hBsBVg0'}}
                  defaultCenter={{lat: 0, lng: 0}}
                  center={center}
                  defaultZoom={15}
                  yesIWantToUseGoogleMapApiInternals
                  options={map => ({
                    fullscreenControl: false,
                    mapTypeId: map.MapTypeId.SATELLITE,
                    clickableIcons: false,
                    zoomControl: false,
                    disableDoubleClickZoom: true,
                    streetViewControl: false,
                    gestureHandling: "none",
                  })}
                >
                  <LocationOnIcon lat={center.lat} lng={center.lng} style={{color: "white", filter: "drop-shadow(0px 0px 6px yellow)"}}/>
                </GoogleMapReact>  
            ) : undefined}
          </div>
        ) : (
          <TableContainer style={{borderRadius: "10px", overflowY: "hidden"}}>
            <GateResponsePreview 
              response={props.isMetric && Object.keys(metricSnapshot).length != 0 ? metricSnapshot.measurements[0] : props.snapshot.measurements[0]} 
              numRows={props.numRows} 
              isMetric={props.isMetric}
              units={props.snapshot.units}/>
          </TableContainer>
        )}
      </Box>
    </Box>
  )
}