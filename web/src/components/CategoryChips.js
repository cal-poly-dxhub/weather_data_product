import React, { useEffect, useState } from 'react';
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

export default function CategoryChips(props) {
  const [ state, dispatch ] = React.useContext(UserContext)
  const classes = useStyles();

  if (state.instruments.options[state.instruments.index].variants.length > 1) {
    return (
      <Grid container direction='column' alignItems='flex-start'>
        <Typography variant="p" style={{color: 'gray', fontWeight: 'bold'}}>
          Category
        </Typography>

        <Box component="ul" className={classes.root}>
           {state.instruments.options[state.instruments.index].variants.map((variant) => {
            let icon;

            return (
            <li key={variant.path}>
                <Chip
                icon={icon}
                label={variant.label}
                color="primary"
                onDelete={undefined}
                className={classes.chip}
                variant="outlined"
                clickable={true}
                onClick={() => {
                   props.setPath(variant.path)
                }}
                />
            </li>
            );
            })}
        </Box>
      </Grid>

    );
  }

  return <div/>
}