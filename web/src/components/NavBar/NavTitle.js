import React, { useState, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Box, useMediaQuery } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Link } from 'react-router-dom';

import theme from '../../theme'

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    whiteSpace: "nowrap"
  },
}));

export default function NavTitle(props) {
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();

  return (
    <Link to="/" style={{textDecoration: "none"}}>
      <Box display="flex" flexDirection="row">
        <Box display="flex">
          <img 
            style={{
              objectFit: "cover",
              width: matchesMd ? 30 : 40, 
              paddingRight: matchesSm ? 0 : 10
            }} 
            src='https://user-images.githubusercontent.com/22374768/121132655-19ccb000-c7cd-11eb-8e26-89c10ca8a8c6.png'
          />
        </Box>

        {matchesSm
          ? undefined
          : (
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2"  className={classes.title}>
                VANDENBERG SPACE FORCE BASE
              </Typography>
              <Typography variant="h5" className={classes.title}>
                SPACEPORT WEATHER ARCHIVE
              </Typography>
            </Box>  
          )
        }
      </Box>
    </Link>
  );  
}