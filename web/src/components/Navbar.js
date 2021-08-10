import React, { useState, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useMediaQuery } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import IconButton from '@material-ui/core/IconButton';
import { ThemeProvider } from '@material-ui/styles';
import LanguageIcon from '@material-ui/icons/Language';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import PostAddIcon from '@material-ui/icons/PostAdd';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import { Box } from '@material-ui/core';

import { Link } from 'react-router-dom';

import theme from '../theme'
import ReportBuilder from './ReportBuilder';
import { UserContext } from '../contexts/UserProvider';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    color: '#9C9C9C',
    marginLeft: theme.spacing(4),
    whiteSpace: 'nowrap'
  },
  title: {
    flexGrow: 1,
    whiteSpace: "nowrap"
  },
  feedbackButton: {
    marginLeft: theme.spacing(7),
    whiteSpace: 'nowrap'
  },
}));

export default function Navbar() {
  const classes = useStyles();
  const [drawerIsOpen, setDrawerOpen] = useState(false);
  const [state, dispatch] = useContext(UserContext);
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const Spacer = require('react-spacer');

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position={matchesMd ? "fixed" : "static"} color={matchesMd ? "secondary" : "transparent"} elevation={matchesMd ? 2 : 0} style={{paddingLeft: matchesMd ? 0 : "4rem", paddingRight: matchesMd ? 0 : "4rem", paddingTop: matchesSm ? 0: matchesMd ? "1rem" :"2rem", paddingBottom: matchesSm ? 0: matchesMd ? "1rem" :"2rem"}}>
        <Toolbar className={classes.root} style={{marginLeft: matchesSm ? 10 : 50, marginRight: matchesSm ? 10 : 50}}>
          <img style={{width: matchesMd ? 30 : 40, paddingRight: matchesSm ? 0 : 10}} src='https://user-images.githubusercontent.com/22374768/121132655-19ccb000-c7cd-11eb-8e26-89c10ca8a8c6.png'/>
          
          {matchesSm
          ? undefined
          : (
            <Grid container spacing={0} justify='space-evenly' direction='column'>
              <Link to="/" style={{textDecoration: "none"}}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2"  className={classes.title}>
                    VANDENBERG SPACE FORCE BASE
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" className={classes.title}>
                    SPACEPORT WEATHER ARCHIVE
                  </Typography>
                </Grid>
              </Link>
            </Grid>    
          )}

          <Spacer grow='1' />

          {matchesMd
          ? undefined
          : (
            <Toolbar>
              <Button className={classes.menuButton} variant="text" size="small" color="primary">
                <a style={{textDecoration: 'none'}} href="https://documenter.getpostman.com/view/13220876/Tzsijifs">
                  <Typography variant="body1" display="block" style={{ margin: "0.5rem", color: "#9C9C9C", marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                    API Docs
                  </Typography>
                </a>
              </Button>

              <Button className={classes.feedbackButton} size="large" color="primary">
                <a style={{textDecoration: 'none'}} href="https://forms.gle/smfZiATVcvbEaRGN9">
                  <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '1rem', marginRight: '1rem', fontWeight: "bold" }}>
                    Give Feedback
                  </Typography>
                </a>
              </Button>
            </Toolbar>
          )}

          <IconButton edge="start" className={classes.menuButton} aria-label="units" onClick={() => {
            dispatch({
              type: "settings/imperial",
              payload: !state.settings.imperial
            })
          }}>
            <Box flexDirection="column" display="flex" alignItems="center">
              <LanguageIcon/>
              <Typography variant="subtitle2">{state.settings.imperial ? 'Imperial' : 'Metric'}</Typography>
            </Box>
          </IconButton>

          {state.exports.length <= 0
          ? undefined
          : (
            <IconButton edge="start" className={classes.menuButton} onClick={() => setDrawerOpen(true)} aria-label="report">
              <Box flexDirection="column" display="flex" alignItems="center">
                <PostAddIcon/>
                <Typography variant="subtitle2">{`Archive (${state.exports.length})`}</Typography>
              </Box>
            </IconButton>
          )}

          <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={drawerIsOpen} onClick={handleClose}>
            <ReportBuilder open={drawerIsOpen} setDrawerOpen={setDrawerOpen}></ReportBuilder>
          </Backdrop>

          <IconButton edge="end" className={classes.menuButton} onClick={handleClick}>
            {matchesMd ? <MoreVertIcon/> : <InfoOutlinedIcon/> }
          </IconButton>
            <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            style={{backgroundColor: 'rgba(0,0,0,0.4)'}}
          >
            {matchesMd ? (
              <div>
              <MenuItem onClick={handleClose}>
                <a style={{textDecoration: 'none', color: 'white'}} href="https://documenter.getpostman.com/view/13220876/Tzsijifs">
                  API Docs
                </a>
                </MenuItem>
              <MenuItem onClick={handleClose}>
                <a style={{textDecoration: 'none', color: 'white'}} href="https://forms.gle/smfZiATVcvbEaRGN9">
                  Give Feedback
                </a>
              </MenuItem>
              <Divider style={{backgroundColor: "#3c3540", marginTop: "5px"}}/>
              </div>
            ) : undefined}
            <div style={{padding: "1rem"}}>
              <Typography variant="subtitle2" style={{color: "#635b69"}}>VAFB XUI Demo</Typography>
              <Typography variant="body2" style={{color: "#635b69"}}>Version 3.1</Typography>
            </div>
          </Menu>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}