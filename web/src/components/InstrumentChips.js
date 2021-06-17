import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import TagFacesIcon from '@material-ui/icons/TagFaces';

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

export default function InstrumentChips() {
  const [ state, dispatch ] = React.useContext(UserContext)
  const classes = useStyles();

  return (
    <Box component="ul" className={classes.root}>
      {state.instruments.options.map((instrument) => {
        let icon;

        let isClickable = (instrument.label == "Tower" || instrument.label == "Sodar" );

        if (instrument.label === 'React') {
        icon = <TagFacesIcon />;
        }

        return (
        <li key={instrument.key}>
            <Chip
            icon={icon}
            label={instrument.label}
            color={isClickable ? "primary" : "secondary"}
            onDelete={undefined}
            className={classes.chip}
            variant={instrument.key == state.instruments.index ? "default" : "outlined"}
            clickable={isClickable}
            onClick={() => {
              if (isClickable) {
                dispatch({ type: "instrument/selector", payload: instrument.key })}
              }}
            />
        </li>
        );
        })}
    </Box>
  );
}