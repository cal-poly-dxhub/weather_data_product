import React, { useEffect, useState } from 'react';
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

export default function LocationChips(props) {
  const [ state, dispatch ] = React.useContext(UserContext)
  const classes = useStyles();

  return (
    <Box component="ul" className={classes.root}>
      {props.locations.map((location) => {
        let icon;

        return (
        <li key={location}>
            <Chip
            icon={icon}
            label={location}
            color="primary"
            onDelete={undefined}
            className={classes.chip}
            variant="outlined"
            clickable={true}
            // onClick={() => {
            //   if (isClickable) {
            //     dispatch({ type: "instrument/selector", payload: instrument.key })}
            //   }}
            />
        </li>
        );
        })}
    </Box>
  );
}