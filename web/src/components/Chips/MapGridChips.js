import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';

import { Link, useRouteMatch } from 'react-router-dom';

import { UserContext } from "../../contexts/UserProvider"

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'leading',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    marginTop: 5,
    // backgroundColor: "yellow"
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export default function MapGridChips(props) {
  const [ state, dispatch ] = React.useContext(UserContext)
  const classes = useStyles();
  const match = useRouteMatch()

  return (
    <Grid container direction='column' alignItems='flex-start'>
      <Typography variant="body1" style={{color: 'gray', fontWeight: 'bold'}}>
        View
      </Typography>

      <Box component="ul" className={classes.root}>
        <Link to={`${props.baseURL}/map`} style={{textDecoration: "none"}}>
          <Chip
              label="MAP"
              color="primary"
              onDelete={undefined}
              variant={"map" == props.category ? "default" : "outlined"}
              className={classes.chip}
              onClick={() => {
                  props.setCategory("map")
              }}
          />
        </Link>
        <Link to={`${props.baseURL}/list`} style={{textDecoration: "none"}}>
          <Chip
              label="LIST"
              color="primary"
              onDelete={undefined}
              variant={"list" == props.category ? "default" : "outlined"}
              className={classes.chip}
              onClick={() => {
                props.setCategory("list")
              }}
          />
        </Link>
      </Box>
    </Grid>

  );

  return <div/>
}