import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { colors } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import theme from '../theme'
import Brightness4Icon from '@material-ui/icons/Brightness4';
import PostAddIcon from '@material-ui/icons/PostAdd';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box'

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    marginRight: 50,
    marginLeft: 50
  },
  menuButton: {
    color: '#9C9C9C',
    marginLeft: theme.spacing(6),
    whiteSpace: 'nowrap'
  },
  title: {
    flexGrow: 1,
  },
  feedbackButton: {
    marginLeft: theme.spacing(6),
    whiteSpace: 'nowrap'
  },
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Toolbar className={classes.root}>
        <img style={{width: 40}} src='https://user-images.githubusercontent.com/22374768/121132655-19ccb000-c7cd-11eb-8e26-89c10ca8a8c6.png'/>
        <Grid container spacing={0} justify='space-evenly' direction='column'>
          <Grid item xs={12}>
            <Typography variant="subtitle2" className={classes.title}>
              VANDENBERG SPACE FORCE BASE
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" className={classes.title}>
              SPACEPORT WEATHER ARCHIVE
            </Typography>
          </Grid>
        </Grid>
        <Button className={classes.menuButton} variant="text" size="small" color="primary">
          <Typography variant="body1" display="block" style={{ margin: "0.5rem", color: "#9C9C9C", marginLeft: '3rem', marginRight: '3rem' }}>
            API Docs
          </Typography>
        </Button>
        <Button className={classes.feedbackButton} size="large" color="primary">
          <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
            Give Feedback
          </Typography>
        </Button>
        <IconButton edge="start" className={classes.menuButton} aria-label="dark mode">
          <Brightness4Icon/>
        </IconButton>
        <IconButton edge="start" className={classes.menuButton} aria-label="report">
          <PostAddIcon/>
        </IconButton>
      </Toolbar>
    </ThemeProvider>
  );
}