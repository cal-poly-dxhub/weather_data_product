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

import Grid from '@material-ui/core/Grid';

import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';

function TablePanel(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    console.log("hello")
    console.log("testing:", props.measurements['measurements'][0])
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      {props.measurements['measurements'].map(measurement => 
        <TableContainer style={{ borderColor: '#464646'}} component={Paper} variant="outlined" key={measurement['metadata']['measurement_id']}>
          <Toolbar style={{backgroundColor: '#242026'}}>
            <Grid container justify='space-between' alignItems="center">
              <Button aria-controls="simple-menu" aria-haspopup="true" variant="text" onClick={handleClick}>
                <Typography variant="body1" style={{fontWeight: 'bold'}}>
                  Wind & Gust
                </Typography>
                <IconButton edge="start" style={{color: '#9E9C98'}}>
                  <UnfoldMoreIcon/>
                </IconButton>
              </Button>

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
                <TableCell align="right">Wind Speed</TableCell>
                <TableCell align="right">Wind Direction (Deg)</TableCell>
                <TableCell align="right">Gust Speed</TableCell>
                <TableCell align="right">Gust Direction (Deg)</TableCell>
                <TableCell align="right">Wind (Vertical)</TableCell>
                <TableCell align="right">Wind (SD)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {measurement['gateResponses'].map(response => (
                <TableRow key={response['GateNum']}>
                  <TableCell component="th" scope="row">
                    {response['HT']}
                  </TableCell>
                  <TableCell align="right">{response['SPD']}</TableCell>
                  <TableCell align="right">{response['DIR']}</TableCell>
                  <TableCell align="right">{response['GSPD']}</TableCell>
                  <TableCell align="right">{response['GDIR']}</TableCell>
                  <TableCell align="right">{response['W']}</TableCell>
                  <TableCell align="right">{response['SDW']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default TablePanel;