import React, { useState } from 'react';

import Slider from '@material-ui/core/Slider';
import { Divider, Typography } from '@material-ui/core';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import TablePaginationActions from './TablePaginationActions';

export default function TableControls(props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
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

  const timestamp = (
    <Typography 
      variant="subtitle2" 
      style={{
        color: currentIndex == 0 ? "black" : "gray", 
        backgroundColor: currentIndex == 0 ? "yellow" : "#2a272e", 
        minWidth: "150px",
        maxWidth: "200px",
        padding: "5px", 
        borderRadius: "5px", 
        textAlign: "center",
      }}>
        {`${props.timestamps[currentIndex]} ${currentIndex == 0 ? '(Most Recent)' : ''}`}
    </Typography>
  );

  const pagination = (
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
      style={{borderWidth: 0, padding: 0, overflowX: "scroll"}}
    />
  );

  const slider = (
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
      style={{width: props.numMeasurements * 50, maxWidth: "300px", marginLeft: "10px"}}
    />
  );

  if (props.numMeasurements > 1 && matchesSm) {   // Mobile and Requires Time Slider
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center">
          <Box 
            display="flex"
            alignItems="center" 
            justifyContent="center"
            style={{
              minWidth: "98%",
              padding: "10px"
            }}>          
            {slider} <Spacer grow={1} width={20}/> {timestamp}
          </Box>

          <Divider style={{backgroundColor: "#464646", minWidth: "100%"}}/>

          {pagination}
      </Box>
    );
  } else {    // Mobile and no slider, or Desktop w/ or w/o slider
    return (
      <Box 
        display="flex"
        alignItems="center" 
        justifyContent="center"
        style={{padding: "10px"}}>
        {pagination}

        {props.numMeasurements > 1 ? slider : undefined}

        <Spacer grow={1} width={10}/>

        {timestamp}
      </Box>
    );
  }
}