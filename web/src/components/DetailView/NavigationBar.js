import React, { useState, useEffect, useContext } from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';

import theme from '../../theme'

import MetadataItem from '../Misc/MetadataItem';

import { UserContext } from '../../contexts/UserProvider';

import { useHistory } from "react-router-dom"

function AddToArchiveButton(props) {
  const [isInArchive, addToArchive] = useState(false);

  useEffect(() => {
    if (props.state == null) { return }
    
    for (var i = 0; i < props.state.exports.length; i++) {
      if (
        props.state.exports[i].instrument == props.archiveMetadata.instrument &&
        props.state.exports[i].category == props.archiveMetadata.category &&
        props.state.exports[i].assetID == props.archiveMetadata.assetID &&
        props.state.exports[i].location == props.archiveMetadata.location
      ) {
          addToArchive(true);
          break;
      }
    }
  }, [props.state])

  return (
    <Button 
      disableRipple={isInArchive}
      variant={isInArchive ? "outlined" : "contained"} 
      color="primary" disableElevation 
      style={{maxHeight: "50px"}} 
      onClick={() => {
        if (!isInArchive) {
          props.dispatch({
            type: "exports/add",
            payload: props.archiveMetadata
          });  
        }
    }}>
      {isInArchive ? 'Added to Archive' : 'Add to Archive'}
    </Button>
  )
}

export default function DetailNavigationBar(props) {  
  const Spacer = require('react-spacer')
  const history = useHistory();
  const [state, dispatch] = useContext(UserContext);
  const matchesSm = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Box display="flex" flexDirection={matchesSm ? 'column' : 'row'} alignItems="center" style={{paddingBottom: "2rem", minWidth: "100%"}}>
      <Box display="flex" alignItems="center" style={{minWidth: matchesSm ? "100%" : "Auto"}}>
        <IconButton edge="start" aria-label="Go Back" style={{color: "gray"}} onClick={() => {
          history.goBack()
        }}>
          <ArrowBackIcon fontSize="large"/>
        </IconButton>

        <Spacer grow={1}/>

        {matchesSm ? (
          <AddToArchiveButton dispatch={dispatch} state={state} archiveMetadata={props.archiveMetadata}/>
        ) : undefined}
      </Box>

      <Spacer height='20px'/>
    
      <Box 
        flexGrow={1} 
        style={{
          minWidth: matchesSm ? "100%" : "Auto", 
          backgroundColor: matchesSm ? "#2a272e" : "#1C1A1E", 
          borderRadius: "10px", paddingTop: "10px", 
          paddingBottom: "10px"
        }}
      >
        <Typography variant="h3" style={{fontWeight: "bold", textAlign: matchesSm ? "center" : "left", padding: matchesSm ? 10 : 0}}>
          {props.snapshot.instrument.location}
        </Typography>
      </Box>

      <Spacer width='50px' height='30px'/>

      <Box 
        display="flex" 
        flexWrap="nowrap" 
        justifyContent="center" 
        alignContent="center" 
        alignItems="center"
        style={{
          borderRadius: "10px", 
          borderColor: "#2a272e", 
          borderWidth: "2px", 
          borderStyle: "solid", 
          minWidth: matchesSm ? "100%" : "Auto", 
          paddingTop: "10px", 
          paddingBottom: "10px"
        }}
      >
        <Spacer width={matchesSm ? '0px' : '10px'}/>

        {("BalloonType" in props.snapshot.instrument)
          ? (
            <Box display="flex" flexWrap="nowrap">
              <Box>
                <MetadataItem direction="column" title="BALLOON TYPE" value={props.snapshot.instrument.BalloonType}/>
              </Box>
              <Spacer width='40px'/>
              <Box>
                <MetadataItem direction="column" title="LAUNCH" value={props.snapshot.instrument.location}/>
              </Box>
            </Box>
          )
          : (
            <Box display="flex" flexWrap="nowrap">
              <Box>
                <MetadataItem direction="column" title="HEIGHT" value={`${props.snapshot.instrument.asset_height} ${props.isMetric ? 'm' : 'ft'}`}/>
              </Box>
              <Spacer width='40px'/>
              <Box>
                <MetadataItem direction="column" title="ID" value={props.snapshot.instrument.asset_id}/>
              </Box>
            </Box>  
        )}

        <Spacer width={matchesSm ? '0px' : '50px'}/>

        {matchesSm ? undefined : (
          <AddToArchiveButton dispatch={dispatch} archiveMetadata={props.archiveMetadata}/>
        )}

        <Spacer width={matchesSm ? '0px' : '10px'}/>
      </Box>
    </Box>
  )
}