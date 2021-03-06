import React, { useState, useContext, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import TagFacesIcon from '@material-ui/icons/TagFaces';
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
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export default function InstrumentChips(props) {
  const [state, dispatch] = useContext(UserContext);
  const classes = useStyles();
  const match = useRouteMatch();

  // useEffect(() => {
  // }, [])

  return (
    <Grid container direction='column' alignItems='flex-start'>
      <Typography variant="body1" style={{color: 'gray', fontWeight: 'bold'}}>
        Instruments
      </Typography>

      <Box component="ul" className={classes.root} display="flex" flexWrap="nowrap">
        {
          Object.keys(state.instruments).map((key, index) => (
            <li key={key}>
              <Link to={`${match.url}/${key}`} style={{textDecoration: "none"}}>
                <Chip
                label={key.toUpperCase()}
                color={"primary"}
                onDelete={undefined}
                className={classes.chip}
                variant={key == props.instrument ? "default" : "outlined"}
                onClick={() => {
                  props.setInstrument(key);
                  if (state.instruments[key].data == null) {    // e.g. profiler
                    props.setCategory(Object.keys(state.instruments[key])[1])
                  }

                  localStorage.setItem("instrumentKey", key)
                  }}
                />
              </Link>
            </li>
          )) 
        }
      </Box>
    </Grid>
  );
}