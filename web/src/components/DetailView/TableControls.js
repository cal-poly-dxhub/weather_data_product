import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import { Grid, TableContainer } from '@material-ui/core';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import TablePaginationActions from './TablePaginationActions';

export default function TableControls(props) {
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