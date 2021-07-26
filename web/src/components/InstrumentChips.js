import React, { useState, useContext } from 'react';

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
  const [selected, changeSelectionTo] = useState(0);
  const [state, dispatch] = useContext(UserContext);
  const classes = useStyles();

  return (
    <Grid container direction='column' alignItems='flex-start'>
      <Typography variant="body1" style={{color: 'gray', fontWeight: 'bold'}}>
        Instruments
      </Typography>

      <Box component="ul" className={classes.root}>
        {
          Object.keys(state.instruments).map((key, index) => (
            <li key={key}>
              <Chip
              label={key.toUpperCase()}
              color={"primary"}
              onDelete={undefined}
              className={classes.chip}
              variant={index == selected ? "default" : "outlined"}
              onClick={() => {
                changeSelectionTo(index);
                props.setInstrument(key);
                }}
              />
            </li>
          )) 
        }
      </Box>
    </Grid>
  );
}