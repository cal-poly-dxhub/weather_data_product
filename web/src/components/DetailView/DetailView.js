import React, { useState, useEffect, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { DataGrid } from '@material-ui/data-grid';

import { UserContext } from '../../contexts/UserProvider';

import { useParams } from 'react-router';

import DetailNavigationBar from './NavigationBar';
import TableControls from './TableControls';
import GenericTable from './GenericTable';
import PlaceholderDetail from '../Misc/PlaceholderDetail';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    height: "100%",
    backgroundColor: '#242026',
  },
  datatable: {
    '& .super-app-theme--cell': {
      borderColor: "#464646"
    },
  }
});

export default function DetailView(props) {
  const classes = useStyles();
  const [state, dispatch] = useContext(UserContext);
  const [measurementIndex, setMeasurementIndex] = useState(0);
  const [numMeasurements, setNumMeasurements] = useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);
  const [failedToLoad, setFailedToLoad] = useState(false);

  let { asset_id } = useParams();

  useEffect(() => {
    props.setInstrument(props.instrument);
    props.setCategory(props.category);

    if (props.snapshot.measurements == null) {
      props.apiManager.sendSnapshotRequest(
        state.instruments[props.instrument].path, 
        state.instruments[props.instrument][props.category] ? state.instruments[props.instrument][props.category].path : null, 
        asset_id
      ).then((snapshotsData) => {
        if (snapshotsData.length == 1) {

          switch (props.instrument) {
            case "tower":
              props.apiManager.sendTowerCodesRequest()
              .then(columnsToSave => {
                props.setFocusedColumns(columnsToSave);
    
                let towerSnapshotsData = props.apiManager.mapCodesToSnapshotData(snapshotsData, columnsToSave);
                props.setFocusedSnapshot(towerSnapshotsData[0]);

                let metricFocusedSnapshot = props.apiManager.convertToMetric(towerSnapshotsData);
                props.setFocusedSnapshotMetric(metricFocusedSnapshot[0]);      
              });    
              break;
            default:
              props.setFocusedSnapshot(snapshotsData[0]);

              let metricFocusedSnapshot = props.apiManager.convertToMetric(snapshotsData);
              props.setFocusedSnapshotMetric(metricFocusedSnapshot[0]);    
              break;
          }

          setNumMeasurements(snapshotsData[0].measurements.length);
        } else {
          setFailedToLoad(true);
        }
      });
    } else {
      setNumMeasurements(props.snapshot.measurements.length);
    }
  }, []);

  const archiveMetadata = {
    instrument: props.instrument,
    category: props.category,
    assetID: asset_id,
    location: props.snapshot.instrument ? props.snapshot.instrument.location : "null",
    from: '2017-05-24T10:30',
    to: '2017-05-25T11:30'
  }

  if (props.snapshot && props.snapshot.measurements) {
    return (
      <Box flexDirection="column" style={{paddingTop: "1rem"}}>
        <DetailNavigationBar {...props} setGoBack={props.setGoBack} archiveMetadata={archiveMetadata}/>
        <Card className={classes.root} variant="outlined">
          <CardContent style={{padding: 0}}>
          <Box display="flex" flexDirection='column'>
            <TableControls 
              instrument={props.instrument}
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
  
            {props.instrument == "tower" ?
            (
              <div style={{ width: '100%' }}>
                <DataGrid
                  rows={props.snapshot.measurements[measurementIndex].gateResponses}
                  columns={props.focusedColumns}
                  pageSize={rowsPerPage}
                  disableSelectionOnClick
                  disableColumnMenu={true}
                  className={classes.datatable}
                  autoHeight
                  hideFooter
                />
              </div>
            ) : (
              <GenericTable 
                response={props.snapshot.measurements[measurementIndex]} 
                rowsPerPage={rowsPerPage}
                page={page}
                units={props.units}
                isMetric={props.isMetric}
              />
            )
            }
          </Box>
          </CardContent>
        </Card>
      </Box>
    );
  } else if (failedToLoad) {
    return (
      <Typography variant="h3" style={{
        color: "gray", 
        paddingLeft: "10%", 
        paddingRight: "10%", 
        paddingTop: "200px", 
        textAlign: "center", 
        fontWeight: "bold"
      }}>
        Sorry! That instrument is missing!
      </Typography>
    );
  } else {
    return (
      <PlaceholderDetail/>
    );
  }
}