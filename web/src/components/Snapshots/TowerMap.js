import React, { useState, useEffect, useContext } from 'react';

import Box from '@material-ui/core/Box';
import { useMediaQuery } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';

import DetailView from '../DetailView/DetailView';

import theme from '../../theme'
import { UserContext } from '../../contexts/UserProvider';

import GoogleMapReact from 'google-map-react';
import TowerCard from './TowerCard';
import { Switch, useRouteMatch, Route, Redirect } from 'react-router-dom';

export default function TowerMap(props) {
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    props.selectMetadata({});
  }, []);

  return (
    <Box 
      display="flex"
      flexGrow={1}
      style={{
        minWidth: matchesXs ? "100%" : "Inherit",
        width: "1200px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {Object.keys(props.selectedMetadata).length > 0 ? (
      <Box 
        display="flex"
        style={{
          zIndex: 1, 
          width: "calc(100% - 40px)",
          maxWidth: "500px",
          minHeight: "100px", 
          maxHeight: "700px",
          position: "absolute",
        }}>
          <Box 
            display="flex" 
            flexDirection="column" 
            style={{
              margin: 20,
              minWidth: "calc(100% - 40px)",
              minHeight: "100%",
              backgroundColor: "#242026",
              borderRadius: "10px",
            }}
          >
            <TowerCard
              metadata={props.selectedMetadata}
              setInstrument={props.setInstrument}
              setCategory={props.setCategory}
              setFocusedSnapshot={props.setFocusedSnapshot} 
              setFocusedSnapshotMetric={props.setFocusedSnapshotMetric}  
              apiManager={props.apiManager}  
            />
          </Box>
      </Box>
      ) : undefined}

      <Box 
        style={{
          zIndex: 0, 
          minWidth: "100%",
          minHeight: "500px",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyCpDdUirt6fRgnMFCuORsAQXOC3hBsBVg0'}}
          defaultCenter={{lat: 34.712686, lng: -120.583249}}
          defaultZoom={10.5}
          zoom={matchesSm ? 10 : 10.5}
          yesIWantToUseGoogleMapApiInternals
          options={map => ({
            fullscreenControl: false,
            // mapTypeId: map.MapTypeId.SATELLITE,
            // clickableIcons: false,
            zoomControl: true,
            // disableDoubleClickZoom: true,
            // streetViewControl: false,
            draggableCursor: "default",
            draggingCursor: "pointer",
            gestureHandling: "greedy",
          })}
        >
          {props.metadata.map(icon => (
            <LocationOnIcon 
              key={`${icon.latitude}_${icon.longitude}`}
              lat={icon.latitude} 
              lng={icon.longitude} 
              style={{
                color: props.selectedMetadata.archive_number == icon.archive_number ? "black" : "#b5b5b5", 
                filter: props.selectedMetadata.archive_number == icon.archive_number ? "drop-shadow(0px 0px 6px yellow)" : null
                }}
              onClick={() => {
                let found = props.metadata.find(meta => meta.archive_number == icon.archive_number)
                props.selectMetadata(found);
              }}
              onMouseOver={() => {
                
              }}
            />
          ))}
        </GoogleMapReact> 
      </Box> 
    </Box>
  );
}