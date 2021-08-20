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

import { matchPath, useHistory } from "react-router-dom"

function AddToArchiveButton(props) {
  const [isInArchive, addToArchive] = useState(false);

  useEffect(() => {
    if (props.exports == null) { return }

    for (var i = 0; i < props.exports.length; i++) {
      if (
        props.exports[i].instrument == props.archiveMetadata.instrument &&
        props.exports[i].category == props.archiveMetadata.category &&
        props.exports[i].assetID == props.archiveMetadata.assetID &&
        props.exports[i].location == props.archiveMetadata.location
      ) {
          addToArchive(true);
          break;
      }
    }
  }, [props.exports])

  return (
    <Button 
      disableRipple={isInArchive}
      variant={isInArchive ? "outlined" : "contained"} 
      color="primary" disableElevation 
      style={{maxHeight: "50px", whiteSpace: "nowrap"}} 
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
          history.push(`/home/${props.instrument}${props.category == "" ? "" : `/${props.category}`}`);

          if (props.instrument != "tower") {
            props.setGoBack(true);
          }
        }}>
          <ArrowBackIcon fontSize="large"/>
        </IconButton>

        <Spacer grow={1}/>

        {matchesSm ? (
          <AddToArchiveButton dispatch={dispatch} exports={state.exports} archiveMetadata={props.archiveMetadata}/>
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
        alignContent="center" 
        alignItems="center"
        justifyContent={matchesSm ? "center" : "left"}
        style={{
          borderRadius: "10px", 
          borderColor: "#2a272e", 
          borderWidth: Object.keys(props.selectedMetadata).length > 0 ? "2px" : 0, 
          borderStyle: "solid", 
          width: matchesSm ? "100%" : "Auto", 
          maxWidth: matchesSm ? "100%" : "60%",
          paddingTop: "10px", 
          paddingBottom: "10px",
          overflowY: "hidden",
        }}
      >
        <Box 
          display="flex"
          alignItems="center"
          style={{
            overflowX: "scroll",
            msOverflowStyle: "none",
            marginBottom: "-30px"
          }}
        >
          {Object.entries(props.selectedMetadata).map(item => {
            if (typeof item[1] == "string" || typeof item[1] == "number") {
              return (
                <Box
                  style={{
                    paddingBottom: "30px"
                  }}
                >
                  <MetadataItem 
                    direction="column" 
                    title={item[0]} 
                    value={item[1]}
                  />
                </Box>
              );  
            }
          })}

          <Box style={{paddingLeft: matchesSm ? 0 : "35px"}}>
            &nbsp;
          </Box>
        </Box>

        <Box 
          style={{
            width: matchesSm ? '0px' : '20px',
            marginRight: matchesSm ? 0 : "-30px",
            backgroundColor: "#1C1A1E",
            boxShadow: matchesSm ? null : "0 0 20px 40px #1C1A1E",
            height: "100%",
            zIndex: 1
          }}
        >
          &nbsp;
        </Box>

        {matchesSm ? undefined : (
          <Box
            style={{
              zIndex: 3
            }}
          >
            <AddToArchiveButton 
              dispatch={dispatch} 
              exports={state.exports} 
              archiveMetadata={props.archiveMetadata}
            />
          </Box>
        )}

        <Spacer width={matchesSm ? '0px' : '15px'}/>
      </Box>
    </Box>
  )
}