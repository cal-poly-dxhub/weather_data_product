import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import TagFacesIcon from '@material-ui/icons/TagFaces';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';

import { Link, useRouteMatch } from 'react-router-dom';

import { UserContext } from "../contexts/UserProvider"

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'leading',
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
  const match = useRouteMatch()

  useEffect(() => { }, []);

  return (
    <Grid container direction='column' alignItems='flex-start'>
      <Typography variant="p" style={{color: 'gray', fontWeight: 'bold'}}>
        Category
      </Typography>

      <Box component="ul" className={classes.root}>
          {Object.keys(props.instrument).map((key, index) => {

            if (index == 0 ){ return }

            return (
              <li key={key}>
                <Link to={`${match.path}/${key}`}>
                  <Chip
                  label={key.toUpperCase()}
                  color="primary"
                  onDelete={undefined}
                  variant={key == props.category ? "default" : "outlined"}
                  className={classes.chip}
                  onClick={() => {
                    props.setCategory(key)
                  }}
                  />
                </Link>
              </li>
            );
          })}
      </Box>
    </Grid>

  );

  return <div/>
}