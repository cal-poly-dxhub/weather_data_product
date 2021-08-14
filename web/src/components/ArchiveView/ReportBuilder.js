import React, { useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowForwardIosRounded from '@material-ui/icons/ArrowForwardIosRounded';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { useMediaQuery } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { UserContext } from '../../contexts/UserProvider';
import APIManager from '../../api/APIManager';

import theme from '../../theme'
import DownloadAlert from './DownloadAlert';

export default function ReportBuilder(props) {
  const [ state, dispatch ] = React.useContext(UserContext);
  const Spacer = require('react-spacer');
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const apiManager = new APIManager();
  const [isDownloading, didBeginDownloading] = React.useState(false);
  const [downloadUrl, setDownloadUrl] = React.useState(null);

  const onFocus = () => {
    didBeginDownloading(false);
  };

  useEffect(() => {
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  });

  const useStyles = makeStyles({
    paper: {
      minWidth: matchesSm ? "100%" : "Auto",
      height: "100%",
      backgroundColor: '#1C1A1E',
      margin: matchesSm ? "0px" : "20px",
      borderRadius: "10px",
      overflowY: 'scroll',
    }
  });  

  const classes = useStyles();

  return (
    <div style={{width: matchesSm ? "100%" : 550 }}>
      <Backdrop style={{zIndex: theme.zIndex.drawer + 1, color: '#fff'}} open={isDownloading}>
        <Box flexDirection="column" display="flex" alignItems="center">
          <CircularProgress color="inherit" />
          <Spacer height={20}/>
          <Typography>Downloading...</Typography>
        </Box>
      </Backdrop>
      <Drawer elevation={12} anchor='right' variant="persistent" open={props.open} classes={{paper: classes.paper}}>
        <AppBar position="static" color="transparent">
          <Toolbar>
            <IconButton style={{backgroundColor: "#302a33"}} onClick={() => {
              props.setDrawerOpen(false);
            }}>
              <ArrowForwardIosRounded style={{color: "white"}}/>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box display="flex" flexDirection="column" style={{minWidth: "100%"}}>

          {state.exports.map((item) => {
            return (
              <Card style={{backgroundColor: "#1C1A1E", margin: "1rem"}} variant="outlined" id={item.assetID}>
                <Box display="flex" flexDirection="column" style={{margin: "1rem"}}>
                  <Box display="flex" alignItems="center">

                    <Box display="flex" flexDirection="column">
                      <Box>
                        <Typography variant="subtitle2" style={{color: "gray"}}>
                          {item.instrument}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4">
                          {item.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Spacer grow={1}/>

                    <Box display="flex" flexDirection="column">
                      <TextField
                        id="datetime-local"
                        label="From"
                        type="datetime-local"
                        defaultValue="2017-05-24T10:30"
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />

                      <TextField
                        id="datetime-local"
                        label="To"
                        type="datetime-local"
                        defaultValue="2017-05-24T10:30"
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>

                    <Spacer grow={1}/>

                    <Box flexDirection="column" display="flex" alignItems="center">
                      <Button size="large" color="secondary" onClick={() => {
                        didBeginDownloading(true);
                        apiManager.sendDownloadLinkRequest(state.instruments[item.instrument].path, item.category, item.assetID)
                          .then((url) => {
                            setDownloadUrl(url);
                            console.log(url)
                            didBeginDownloading(false);
                          });
                      }}>
                        <Typography variant="body2" style={{fontWeight: "bold" }}>
                          Download
                        </Typography>
                      </Button>
                      {/* <Typography variant="body2" style={{fontWeight: "bold", color: "gray" }}>
                          32.5 MB
                      </Typography> */}
                    </Box>

                    <DownloadAlert
                      setDownloadUrl={setDownloadUrl}
                      downloadUrl={downloadUrl}
                      isOpen={!isDownloading && downloadUrl}
                      setOpen={didBeginDownloading}
                    />
                  </Box>
                </Box>
              </Card>
            )
          })}

          {/* <Button size="large" color="primary" style={{margin: "1rem"}}>
            <Typography variant="body1" style={{ margin: "0.5rem", marginLeft: '3rem', marginRight: '3rem', fontWeight: "bold" }}>
              Download All
            </Typography>
          </Button> */}
        </Box>
      </Drawer>
    </div>
  );
}
