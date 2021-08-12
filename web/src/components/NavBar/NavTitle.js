import React, { useState, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Link } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    whiteSpace: "nowrap"
  },
}));

export default function NavTitle(props) {
  const classes = useStyles();

  return (
    <Grid container spacing={0} justify='space-evenly' direction='column'>
    <Link to="/" style={{textDecoration: "none"}}>
      <Grid item xs={12}>
        <Typography variant="subtitle2"  className={classes.title}>
          VANDENBERG SPACE FORCE BASE
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" className={classes.title}>
          SPACEPORT WEATHER ARCHIVE
        </Typography>
      </Grid>
    </Link>
  </Grid>
  );  
}