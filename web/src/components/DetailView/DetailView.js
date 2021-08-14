import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { DataGrid } from '@material-ui/data-grid';

import DetailNavigationBar from './NavigationBar';
import TableControls from './TableControls';
import GenericTable from './GenericTable';
import CustomTable from './CustomTable'

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
  const [measurementIndex, setMeasurementIndex] = useState(0);
  const [numMeasurements, setNumMeasurements] = useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);

  useEffect(() => {
    setNumMeasurements(props.snapshot.measurements.length);
    console.log("rows; ", props.snapshot.measurements[measurementIndex].gateResponses, "columns: ", props.columns);
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
          <TableControls 
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
                columns={props.columns}
                pageSize={rowsPerPage}
                disableSelectionOnClick
                disableColumnMenu={true}
                className={classes.datatable}
                autoHeight
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
  )
}