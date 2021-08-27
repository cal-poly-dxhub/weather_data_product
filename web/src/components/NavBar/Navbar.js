import React, { useState, useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useMediaQuery } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import IconButton from '@material-ui/core/IconButton';
import { ThemeProvider } from '@material-ui/styles';
import LanguageIcon from '@material-ui/icons/Language';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import PostAddIcon from '@material-ui/icons/PostAdd';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Box } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';

import theme from '../../theme'
import ReportBuilder from '../ArchiveView/ReportBuilder';
import { UserContext } from '../../contexts/UserProvider';
import NavTitle from './NavTitle';
import MoreMenu from './MoreMenu';

const feedback_form_url = 'https://forms.gle/smfZiATVcvbEaRGN9'
const api_docs_url = 'https://documenter.getpostman.com/view/13220876/Tzsijifs'

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

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function Navbar() {
  const classes = useStyles();
  const [drawerIsOpen, setDrawerOpen] = useState(false);
  const [state, dispatch] = useContext(UserContext);
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const Spacer = require('react-spacer');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modalStyle] = React.useState(getModalStyle);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar 
        position={matchesMd ? "fixed" : "static"} 
        color={matchesMd ? "secondary" : "transparent"} 
        elevation={matchesMd ? 2 : 0} 
        style={{
          margin: "0 auto", 
          maxWidth: matchesMd ? null : "1500px", 
          paddingTop: matchesSm ? 0: matchesMd ? "1rem" :"2rem", 
          paddingBottom: matchesSm ? 0: matchesMd ? "1rem" :"2rem"
        }}
      >
        <Toolbar 
          className={classes.root} 
          style={{
            marginLeft: matchesSm ? 10 : 50, 
            marginRight: matchesSm ? 10 : 50
          }}
        >   
          <NavTitle/>       

          <Spacer grow='1' />

          {matchesMd
          ? undefined
          : (
            <Toolbar>
              <Button className={classes.menuButton} variant="text" size="small" color="primary">
                <a style={{textDecoration: 'none'}} href={api_docs_url}>
                  <Typography variant="body1" display="block" style={{ margin: "0.5rem", color: "#9C9C9C", marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                    API Docs
                  </Typography>
                </a>
              </Button>

              <Button className={classes.feedbackButton} size="large" color="primary">
                <a style={{textDecoration: 'none'}} href={feedback_form_url}>
                  <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '0.5rem', marginRight: '0.5rem', fontWeight: "bold" }}>
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

          <MoreMenu 
            feedback_form_url={feedback_form_url} 
            api_docs_url={api_docs_url}
            anchorEl={anchorEl}
            handleClose={handleClose}/>

          {/* <Modal
            open={true}
            onClose={handleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
          </Modal> */}

        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}