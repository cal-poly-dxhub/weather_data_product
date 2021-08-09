import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowForwardIosRounded from '@material-ui/icons/ArrowForwardIosRounded';
import { Divider, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { useMediaQuery } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import { UserContext } from '../contexts/UserProvider';

import theme from '../theme'
import axios from 'axios';

export default function ReportBuilder(props) {
  const [ state, dispatch ] = React.useContext(UserContext);
  const FileDownload = require('js-file-download');
  const Spacer = require('react-spacer');
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const useStyles = makeStyles({
    paper: {
      width: matchesSm ? "100%" : 550,
      backgroundColor: '#1C1A1E',
    }
  });  

  const classes = useStyles();

  const sendDownloadRequest = async (instrument, category, assetID) => {
    try {
      const baseUrl = 'https://qqviypx48b.execute-api.us-gov-west-1.amazonaws.com/dev/' 
      + state.instruments[instrument].path 
      + (category === "" ? "" : `${state.instruments[instrument][category].path}`) 
      // + `snapshot?assetId=${assetID}&csv=true`;
      + `snapshot?csv=true`;

      axios.get(baseUrl, {
        params: {},
        headers: {
          'Accept': '*/*',
          'x-api-key': 'sbnnxUa0Y94y0rn9YKSah8MyOmRVbmZYtUq9ZbK0',
        }
      }).then((resp) => {
        // console.log("url: ", resp.data);
        if (resp.data != null) {
          var win = window.open(resp.data, '_blank');
          win.focus();
        }
      });
    } catch (err) {
        console.error("async error: ", err);
    }
  };

  return (
    <div>
      <Drawer anchor='right' variant="persistent" open={props.open} classes={{paper: classes.paper}}>
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
                        sendDownloadRequest(item.instrument, item.category, item.assetID)
                      }}>
                        <Typography variant="body2" style={{fontWeight: "bold" }}>
                          Download
                        </Typography>
                      </Button>
                      <Typography variant="body2" style={{fontWeight: "bold", color: "gray" }}>
                          32.5 MB
                      </Typography>
                    </Box>

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
