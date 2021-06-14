import React, { Component, useState, useEffect } from 'react';
import Amplify, { Auth } from 'aws-amplify'
import axios from 'axios';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Toolbar from '@material-ui/core/Toolbar';
import { Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Grid from '@material-ui/core/Grid';

import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';

function removeMissingData(num) {
  const regex = '^[9.]+$';
  var str = num.toString();
  if (str.match(regex)) {
    return 'NA'
  }
  return num
}

function TablePanel(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    console.log("hello")
    console.log("testing:", props.measurements['measurements'][0])
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid container direction="column" spacing={2}>
      {props.measurements['measurements'].map(measurement => 
        <Grid item>
          <TableContainer style={{ borderColor: '#464646'}} component={Paper} variant="outlined" key={measurement['metadata']['measurement_id']}>
            <Toolbar style={{backgroundColor: '#242026'}}>
              <Grid container justify='space-between' alignItems="center">
                <Button aria-controls="simple-menu" aria-haspopup="true" variant="text" onClick={handleClick}>
                  <Typography variant="body1" style={{fontWeight: 'bold'}}>
                    Wind
                  </Typography>
                  <IconButton edge="start" style={{color: '#9E9C98', marginLeft: 0}}>
                    <UnfoldMoreIcon/>
                  </IconButton>
                </Button>

                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose} style={{color: '#000000'}}>Wind</MenuItem>
                  <MenuItem onClick={handleClose} style={{color: '#000000'}}>Gust</MenuItem>
                </Menu>

                <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                  Last Updated: {measurement['metadata']['measurement_date_time']}
                </Typography>
              </Grid>
            </Toolbar>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Table style={{backgroundColor: '#242026'}}>

              <TableHead>
                <TableRow>
                  <TableCell>Tower Height</TableCell>
                  <TableCell align="right">Wind Speed (m/s)</TableCell>
                  <TableCell align="right">Wind Direction (deg)</TableCell>
                  <TableCell align="right">Sample Size</TableCell>
                  <TableCell align="right">Vertical Wind (m/s)</TableCell>
                  <TableCell align="right">Wind (SD)</TableCell>
                  <TableCell align="right">Signal to Noise Ratio</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {measurement['gateResponses'].map(response => (
                  <TableRow key={response['GateNum']}>
                    <TableCell component="th" scope="row">
                      {response['HT']}
                    </TableCell>
                    <TableCell align="right">{removeMissingData(response['SPD'])}</TableCell>
                    <TableCell align="right">{removeMissingData(response['DIR'])}</TableCell>
                    <TableCell align="right">{removeMissingData(response['NW'])}</TableCell>
                    <TableCell align="right">{removeMissingData(response['W'])}</TableCell>
                    <TableCell align="right">{removeMissingData(response['SDW'])}</TableCell>
                    <TableCell align="right">{removeMissingData(response['SNRW'])}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}

export default TablePanel;