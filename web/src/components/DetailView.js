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
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../theme'

import TablePaginationActions from './TablePaginationActions';

import { UserContext } from '../contexts/UserProvider';

import { useHistory } from "react-router-dom"

const useStyles = makeStyles({
  root: {
    // minWidth: 275, 
    height: "100%",
    backgroundColor: '#242026',
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

function AddToArchiveButton(props) {
  return (
    <Button variant="contained" color="primary" disableElevation style={{maxHeight: "50px"}} onClick={() => {
      props.dispatch({
        type: "exports/add",
        payload: props.archiveMetadata
      })
    }}>
      Add to Archive
    </Button>
  )
}

// DETAIL: Toolbar

function ControlsToolbar(props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  const marks = Array(props.numMeasurements).fill(0).map((_, i) => {
    if (i == currentIndex) {
      return({
        value: i,
        label: (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box style={{color: "#616161"}}>{`${props.timestamps[i]}`}</Box>
          </Box>
        )
      })   
    } else {
      return({
        value: i,
      })
    }
  });

  const handleTimeIndexChange = (event, newValue) => {
    setCurrentIndex(newValue);
    props.setMeasurementIndex(newValue);
  };

  const handleChangePage = (event, newPage) => {
    props.setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    props.setRowsPerPage(parseInt(event.target.value, 10));
    props.setPage(0);
  };

  return (
    <Grid direction={matchesMd ? 'column' : 'row'} container justify="space-between" alignItems="center" style={{padding: "0.5rem"}}>
      <Grid item>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          colSpan={3}
          count={props.numGateResponses}
          rowsPerPage={props.rowsPerPage}
          page={props.page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
          style={{borderWidth: 0}}
        />
      </Grid>
      <Grid item style={{minWidth: matchesMd ? "80%" : '50%', paddingRight: matchesMd ? '0px' : '60px'}}>
        {
          props.numMeasurements == 1
          ? (
            undefined
          ) : (
            <Slider
              defaultValue={0}
              onChange={handleTimeIndexChange}
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

// DETAIL: Data Table

function FullTable(props) {  
  const classes = useStyles();
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const keys = Object.keys(props.response.gateResponses[0]);
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
          break
        case "deg":
          keys[index] = key + " (deg)";  
          break
        default:
          break;
      };
    });
    
    setHeaders(keys)
    // console.log("response", props)
  }, [props.response]);

  return (
    <TableContainer style={{padding: "1rem"}}>
      <Table size="small" variant='outlined' aria-label="a dense table" className={classes.table}>
        <TableHead>
          <TableRow>
            {headers.slice(1, 20).map((header) => (
              <TableCell align="right" style={{fontWeight: "bold"}} key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(props.rowsPerPage > 0 ?
            props.response.gateResponses.slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage) :
            props.response.gateResponses).map((row, index) => (
            <TableRow key={index}>
              {Object.keys(props.response.gateResponses[0]).slice(1, 20).map((header) => (
                <TableCell align="right" key={`${index}_${header}`}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// DETAIL: Header

function DetailNavigationBar(props) {  
  const classes = useStyles();
  const Spacer = require('react-spacer')
  const history = useHistory();
  const [state, dispatch] = useContext(UserContext);
  const matchesSm = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Box display="flex" flexDirection={matchesSm ? 'column' : 'row'} alignItems="center" style={{paddingBottom: "2rem", minWidth: "100%"}}>
      <Box display="flex" alignItems="center" style={{minWidth: matchesSm ? "100%" : "Auto"}}>
        <IconButton edge="start" className={classes.menuButton} aria-label="Go Back" onClick={() => {
          history.goBack()
        }}>
          <ArrowBackIcon fontSize="large"/>
        </IconButton>

        <Spacer grow={1}/>

        {matchesSm ? (
          <AddToArchiveButton dispatch={dispatch} archiveMetadata={props.archiveMetadata}/>
        ) : undefined}
      </Box>

      <Spacer height='20px'/>
    
      <Box flexGrow={1} style={{minWidth: matchesSm ? "100%" : "Auto", backgroundColor: matchesSm ? "#2a272e" : "#1C1A1E", borderRadius: "10px", paddingTop: "10px", paddingBottom: "10px"}}>
        <Typography variant="h3" style={{fontWeight: "bold", textAlign: matchesSm ? "center" : "left"}}>
          {props.snapshot.instrument.location}
        </Typography>
      </Box>

      <Spacer width='50px' height='30px'/>

      <Box display="flex" flexWrap="nowrap" alignItems="center" justifyItems="center">
        {("BalloonType" in props.snapshot.instrument)
          ? (
            <Box display="flex" flexWrap="nowrap">
              <Box style={{paddingRight: "40px"}}>
                <QuickMetadataItem title="BALLOON TYPE" value={props.snapshot.instrument.BalloonType}/>
              </Box>
              <Box style={{paddingRight: "40px"}}>
                <QuickMetadataItem title="LAUNCH" value={props.snapshot.instrument.location}/>
              </Box>
            </Box>
          )
          : (
            <Box display="flex" flexWrap="nowrap">
              <Box>
                <QuickMetadataItem title="HEIGHT" value={`${props.snapshot.instrument.asset_height} ${props.isMetric ? 'm' : 'ft'}`}/>
              </Box>
              <Spacer width='40px'/>
              <Box>
                <QuickMetadataItem title="ID" value={props.snapshot.instrument.asset_id}/>
              </Box>
            </Box>  
        )}

        <Spacer width={matchesSm ? '0px' : '50px'}/>

        {matchesSm ? undefined : (
          <AddToArchiveButton dispatch={dispatch} archiveMetadata={props.archiveMetadata}/>
        )}
      </Box>
    </Box>
  )
}

export default function DetailView(props) {
  const classes = useStyles();
  const [ state, dispatch ] = React.useContext(UserContext);
  const [measurementIndex, setMeasurementIndex] = useState(0);
  const [numMeasurements, setNumMeasurements] = useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);

  useEffect(() => {
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
      <DetailNavigationBar {...props} archiveMetadata={archiveMetadata}/>
      <Card className={classes.root} variant="outlined">
        <CardContent style={{padding: 0}}>
        <Box flexDirection='column'>
          <ControlsToolbar 
            archiveMetadata={archiveMetadata}
            numMeasurements={numMeasurements} 
            numGateResponses={props.snapshot.measurements[measurementIndex].gateResponses.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            setPage={setPage}
            page={page}
            timestamps={props.snapshot.measurements.map((measurement) => {
              return measurement.metadata.measurement_date_time
            })}
            setMeasurementIndex={setMeasurementIndex}
          />
          <Divider style={{backgroundColor: "#464646"}}/>
          <FullTable 
            response={props.snapshot.measurements[measurementIndex]} 
            rowsPerPage={rowsPerPage}
            page={page}
            units={props.units}
            isMetric={props.isMetric}
          />
        </Box>
        </CardContent>
      </Card>
    </Box>
  )
}