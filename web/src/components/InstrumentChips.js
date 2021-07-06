import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import TagFacesIcon from '@material-ui/icons/TagFaces';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';

import { UserContext } from "../contexts/UserProvider"

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export default function InstrumentChips(props) {
  const [ state, dispatch ] = React.useContext(UserContext)
  const classes = useStyles();

  return (
    <Grid container direction='column' alignItems='flex-start'>
      <Typography variant="p" style={{color: 'gray', fontWeight: 'bold'}}>
        Instruments
      </Typography>

      <Box component="ul" className={classes.root}>
        {state.instruments.options.map((instrument) => {
          // let icon;

          let isClickable = (instrument.label != "FBWOS" );

          // if (instrument.label === 'React') {
          // icon = <TagFacesIcon />;
          // }

          return (
          <li key={instrument.key}>
              <Chip
              // icon={icon}
              label={instrument.label}
              color={isClickable ? "primary" : "secondary"}
              onDelete={undefined}
              className={classes.chip}
              variant={instrument.key == state.instruments.index ? "default" : "outlined"}
              clickable={isClickable}
              onClick={() => {
                if (isClickable) {
                  dispatch({ type: "instruments/selector", payload: instrument.key });
                  props.setPath(instrument.variants[0].path);
                }
                }}
              />
          </li>
          );
          })}
      </Box>
    </Grid>
  );
}