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

function TowerMap(props) {
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
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
              backgroundColor: "gray",
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
          defaultZoom={10.6}
          zoom={matchesSm ? 10.6 : 11.2}
          yesIWantToUseGoogleMapApiInternals
          options={map => ({
            fullscreenControl: false,
            mapTypeId: map.MapTypeId.SATELLITE,
            // clickableIcons: false,
            zoomControl: false,
            // disableDoubleClickZoom: true,
            // streetViewControl: false,
            gestureHandling: "none",
          })}
        >
          {props.metadata.map(icon => (
            <LocationOnIcon 
              key={`${icon.latitude}_${icon.longitude}`}
              lat={icon.latitude} 
              lng={icon.longitude} 
              style={{
                color: props.selectedMetadata.archive_number == icon.archive_number ? "black" : "white", 
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

export default function TowerViewSwitch(props) {
  const [metadata, setMetadata] = useState([]);
  const [state, dispatch] = useContext(UserContext);
  const [selectedMetadata, selectMetadata] = useState("");
  const match = useRouteMatch();

  useEffect(() => {
    props.setInstrument("tower");

    let instrumentPath = state.instruments["tower"].path;
    
    props.apiManager.sendMetadataRequest(instrumentPath, "")
      .then((metadata) => {
      setMetadata(metadata);
      });
  }, []);

  return (
    <Switch>
      <Route path={`${match.path}/detail/:asset_id`}>
        <DetailView
          {...props}
          snapshot={!state.settings.imperial ? props.focusedSnapshotMetric : props.focusedSnapshot} 
          instrument="tower"
          category=""
          isMetric={!state.settings.imperial} 
          units={props.focusedSnapshot ? props.focusedSnapshot.units : {}}
        />
      </Route>

      <Route path={`${match.path}/map`}>
        <TowerMap 
          {...props}
          metadata={metadata}
          selectMetadata={selectMetadata}
          selectedMetadata={selectedMetadata}
        />
      </Route>

      <Route path={`${match.path}`}>
        <Redirect to={`${match.path}/map`}/>
      </Route>
    </Switch>
  );
}