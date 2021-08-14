import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import { Grid, TableContainer, Typography } from '@material-ui/core';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import TablePaginationActions from './TablePaginationActions';

export default function TableControls(props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const Spacer = require('react-spacer')

  const marks = Array(props.numMeasurements).fill(0).map((_, i) => {
    if (i == currentIndex) {
      return({
        value: i
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
    <Box display="flex" flexDirection={matchesMd ? 'column' : 'row'} container justify="space-between" alignItems="center">
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
        style={{borderWidth: 0, padding: 0}}
      />

      <Box display="flex" flexGrow={1} flexDirection={matchesMd ? "column" : "row"} alignItems="center" justifyContent="center" style={{paddingBottom: matchesMd ? "10px" : 0, paddingLeft: "20px", paddingRight: "10px", maxWidth: matchesMd ? "90%" : "Inherit"}}>
        <Box style={{width: props.numMeasurements * 50, maxWidth: matchesMd ? "100%" : "35rem", paddingRight: matchesMd ? 0 : "10px"}}>
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
        </Box>

        <Spacer grow={1}/>

        <Box display="flex" justifyContent="center">
          <Typography variant="subtitle2" style={{backgroundColor: "#2a272e", padding: "5px", borderRadius: "5px"}}>{`${props.timestamps[currentIndex]} ${currentIndex == 0 ? '(Most Recent)' : ''}`}</Typography>
        </Box>
      </Box>
    </Box>
  )
}