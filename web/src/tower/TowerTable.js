import React, { Component, useState, useEffect } from 'react';
import { 
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
 } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';

import Toolbar from '@material-ui/core/Toolbar';
import { Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';

import sodar from '../sodar.json';

const useStyles = makeStyles({
  root: {
    borderColor: '#464646',
    backgroundColor: '#242026',
  },
});

function removeMissingData(num) {
  const regex = '^[9.]+$';
  var str = num.toString();
  if (str.match(regex)) {
    return 'NA'
  }
  return num
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton style={{color: '#ffffff', backgroundColor: '#242026'}}/>
      <GridToolbarFilterButton style={{color: '#ffffff', backgroundColor: '#242026'}}/>
      <GridToolbarDensitySelector style={{color: '#ffffff', backgroundColor: '#242026'}}/>
      <GridToolbarExport style={{color: '#ffffff', backgroundColor: '#242026'}}/>
    </GridToolbarContainer>
  );
}

function TowerTable(props) {
  const classes = useStyles();

  const [classification, setClassification] = useState('Wind');
  
  const [anchorEl, setAnchorEl] = useState(null);

  const [columns, setColumns] = useState(
    [
      {
        field: 'HT', 
        headerName: 'Sample Height', 
        type: 'number', 
        width: 170
      },
      {
        field: 'SPD', 
        headerName: 'Wind Speed', 
        type: 'number', 
        width: 160
      },
      {
        field: 'DIR', 
        headerName: 'Wind Direction', 
        type: 'number', 
        width: 160
      },
      {
        field: 'GSPD', 
        headerName: 'Gust Speed', 
        type: 'number', 
        width: 160
      },
      {
        field: 'GDIR', 
        headerName: 'Gust Direction', 
        type: 'number', 
        width: 160
      }
    ]
  );
  // const [rows, setRows] = useState(sodar.measurements[0].gateResponses.map(function(removeMissingData) {
    
  // }));

  const [rows, setRows] = useState(sodar.measurements[0].gateResponses);

  useEffect(() => {
    console.log("testing:", rows)
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    const { myValue } = event.currentTarget.dataset
    setClassification(myValue);
    setAnchorEl(null);
  };

  return (
    <div style={{ height: 400, width: 883 }}>
      <DataGrid className={classes.root} getRowId={(row) => row.GateNum} rows={rows} columns={columns} components={{Toolbar: CustomToolbar}} pageSize={5} checkboxSelection />
    </div>
  );
}

export default TowerTable;