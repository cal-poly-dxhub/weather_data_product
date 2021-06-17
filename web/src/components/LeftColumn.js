import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Divider } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import IconButton from '@material-ui/core/IconButton';

import { UserContext } from "../contexts/UserProvider"

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  menuButton: {
    color: '#9E9C98'
  }
});

function LeftColumn(props) {
  const classes = useStyles();

  const bull = <span className={classes.bullet}>•</span>;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [ state, dispatch ] = React.useContext(UserContext)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    console.log('reefreshed')
  }, [props.id]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Card className={classes.root} variant="outlined">
          <CardContent>

            <Button aria-controls="simple-menu" aria-haspopup="true" variant="text" onClick={handleClick}>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {state.instruments.index == 0 ? 'Tower' : 'Sodar'} {bull} {props['tower']['tower_num']}
              </Typography>
              <IconButton edge="start" className={classes.menuButton} style={{marginLeft: 0}}>
                <UnfoldMoreIcon/>
              </IconButton>
            </Button>
            
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} style={{color: '#000000'}}>Tower {bull} {props['tower']['tower_num']}</MenuItem>
              <MenuItem onClick={handleClose} style={{color: '#000000'}}>Tower {bull} 73</MenuItem>
            </Menu>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Grid container style={{marginBottom: 10, marginTop: 10}} justify='space-between'>
              <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                ARCHIVE NUM
              </Typography>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {props['tower']['archive_num']}
              </Typography>
            </Grid>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Grid container style={{marginBottom: 10, marginTop: 10}} justify='space-between'>
              <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                LATITUDE
              </Typography>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {props['tower']['latitude']}
              </Typography>
            </Grid>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Grid container style={{marginBottom: 10, marginTop: 10}} justify='space-between'>
              <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                LONGITUDE
              </Typography>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {props['tower']['longitude']}
              </Typography>
            </Grid>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Grid container style={{marginBottom: 10, marginTop: 10}} justify='space-between'>
              <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                MSL ELEVATION
              </Typography>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {props['tower']['msl_elevation']}
              </Typography>
            </Grid>

            <Divider style={{backgroundColor: '#623A3A'}}/>

            <Grid container style={{marginBottom: 10, marginTop: 10}} justify='space-between'>
              <Typography variant="body1" style={{fontWeight: 'bold', color: '#9B9B9B'}}>
                LOCATION
              </Typography>
              <Typography variant="body1" style={{fontWeight: 'bold'}}>
                {props['tower']['location']}
              </Typography>
            </Grid>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default LeftColumn;